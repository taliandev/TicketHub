import { useState } from 'react';
import { useCreateEvent, useUpdateOrganizerEvent } from '@/hooks/useOrganizerDashboard';

interface EventFormProps {
  event?: any;
  onSuccess?: () => void;
  onCancel?: () => void;
}

interface TicketType {
  name: string;
  price: number;
  available: number;
  purchaseLimit: number;
  sold?: number;
}

const CATEGORIES = [
  'Technology', 'Entertainment', 'Business', 'Food & Drink', 'Fashion',
  'Sports', 'Arts', 'Gaming', 'Photography', 'Marketing',
  'Music', 'Film', 'Wellness', 'Dance', 'Architecture'
];

const EventForm = ({ event, onSuccess, onCancel }: EventFormProps) => {
  const createMutation = useCreateEvent();
  const updateMutation = useUpdateOrganizerEvent();

  const [formData, setFormData] = useState({
    title: event?.title || '',
    description: event?.description || '',
    date: event?.date ? new Date(event.date).toISOString().slice(0, 16) : '',
    location: event?.location || '',
    category: event?.category || 'Technology',
    img: event?.img || '',
    capacity: event?.capacity || 100,
    status: event?.status || 'draft',
    ticketTypes: event?.ticketTypes || [
      { name: 'General', price: 0, available: 100, purchaseLimit: 10 }
    ]
  });

  const [imagePreview, setImagePreview] = useState(event?.img || '');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [errors, setErrors] = useState<any>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Update preview if img URL changes
    if (name === 'img') {
      setImagePreview(value);
    }
    
    // Clear error when user types
    if (errors[name]) {
      setErrors((prev: any) => ({ ...prev, [name]: '' }));
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setErrors((prev: any) => ({ ...prev, img: 'Vui lòng chọn file ảnh' }));
      return;
    }

    // Validate file size (max 2MB for original file)
    if (file.size > 2 * 1024 * 1024) {
      setErrors((prev: any) => ({ ...prev, img: 'Kích thước ảnh không được vượt quá 2MB' }));
      return;
    }

    setUploadingImage(true);
    setErrors((prev: any) => ({ ...prev, img: '' }));

    try {
      // Compress and resize image
      const compressedImage = await compressImage(file);
      setFormData(prev => ({ ...prev, img: compressedImage }));
      setImagePreview(compressedImage);
      setUploadingImage(false);
    } catch (error) {
      console.error('Error uploading image:', error);
      setErrors((prev: any) => ({ ...prev, img: 'Lỗi khi tải ảnh lên' }));
      setUploadingImage(false);
    }
  };

  // Compress image to reduce size
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          
          // Max dimensions
          const MAX_WIDTH = 1200;
          const MAX_HEIGHT = 800;
          
          let width = img.width;
          let height = img.height;
          
          // Calculate new dimensions while maintaining aspect ratio
          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          // Convert to base64 with compression (0.8 quality)
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.8);
          
          // Check final size (should be under 1MB after compression)
          const sizeInMB = (compressedBase64.length * 3) / 4 / (1024 * 1024);
          if (sizeInMB > 1.5) {
            // If still too large, compress more
            resolve(canvas.toDataURL('image/jpeg', 0.6));
          } else {
            resolve(compressedBase64);
          }
        };
        img.onerror = reject;
      };
      reader.onerror = reject;
    });
  };

  const handleTicketTypeChange = (index: number, field: string, value: any) => {
    const newTicketTypes = [...formData.ticketTypes];
    newTicketTypes[index] = { ...newTicketTypes[index], [field]: value };
    setFormData(prev => ({ ...prev, ticketTypes: newTicketTypes }));
  };

  const addTicketType = () => {
    setFormData(prev => ({
      ...prev,
      ticketTypes: [...prev.ticketTypes, { name: '', price: 0, available: 0, purchaseLimit: 10 }]
    }));
  };

  const removeTicketType = (index: number) => {
    setFormData(prev => ({
      ...prev,
      ticketTypes: prev.ticketTypes.filter((_: TicketType, i: number) => i !== index)
    }));
  };

  const validate = () => {
    const newErrors: any = {};

    if (!formData.title || formData.title.length < 3) {
      newErrors.title = 'Tiêu đề phải có ít nhất 3 ký tự';
    }

    if (!formData.description || formData.description.length < 10) {
      newErrors.description = 'Mô tả phải có ít nhất 10 ký tự';
    }

    if (!formData.date) {
      newErrors.date = 'Vui lòng chọn ngày diễn ra';
    } else if (new Date(formData.date) <= new Date()) {
      newErrors.date = 'Ngày diễn ra phải là ngày trong tương lai';
    }

    if (!formData.location) {
      newErrors.location = 'Vui lòng nhập địa điểm';
    }

    if (!formData.img) {
      newErrors.img = 'Vui lòng nhập URL hình ảnh';
    }

    if (formData.capacity < 1) {
      newErrors.capacity = 'Sức chứa phải lớn hơn 0';
    }

    if (formData.ticketTypes.length === 0) {
      newErrors.ticketTypes = 'Phải có ít nhất 1 loại vé';
    }

    formData.ticketTypes.forEach((ticket: TicketType, index: number) => {
      if (!ticket.name) {
        newErrors[`ticketType_${index}_name`] = 'Tên loại vé không được để trống';
      }
      if (ticket.price < 0) {
        newErrors[`ticketType_${index}_price`] = 'Giá vé không được âm';
      }
      if (ticket.available < 0) {
        newErrors[`ticketType_${index}_available`] = 'Số lượng không được âm';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    const submitData = {
      ...formData,
      date: new Date(formData.date).toISOString(), // Convert to ISO string
      capacity: parseInt(formData.capacity.toString()),
      ticketTypes: formData.ticketTypes.map((t: TicketType) => ({
        ...t,
        price: parseFloat(t.price.toString()),
        available: parseInt(t.available.toString()),
        purchaseLimit: parseInt(t.purchaseLimit.toString())
      }))
    };


    try {
      if (event) {
        await updateMutation.mutateAsync({ eventId: event._id, updates: submitData });
      } else {
        await createMutation.mutateAsync(submitData);
      }
      onSuccess?.();
    } catch (error: any) {
      console.error('Error submitting form:', error);
      
      // Handle validation errors from backend
      if (error.response?.data?.errors) {
        const backendErrors: any = {};
        error.response.data.errors.forEach((err: any) => {
          backendErrors[err.field] = err.message;
        });
        setErrors(backendErrors);
      } else if (error.response?.data?.message) {
        alert(error.response.data.message);
      }
    }
  };

  const isLoading = createMutation.isLoading || updateMutation.isLoading;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tiêu đề sự kiện *
        </label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Nhập tiêu đề sự kiện"
        />
        {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Mô tả *
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={4}
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Nhập mô tả chi tiết về sự kiện"
        />
        {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
      </div>

      {/* Date and Location */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ngày diễn ra *
          </label>
          <input
            type="datetime-local"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {errors.date && <p className="text-red-500 text-sm mt-1">{errors.date}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Địa điểm *
          </label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Nhập địa điểm"
          />
          {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location}</p>}
        </div>
      </div>

      {/* Category and Capacity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Danh mục *
          </label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sức chứa *
          </label>
          <input
            type="number"
            name="capacity"
            value={formData.capacity}
            onChange={handleChange}
            min="1"
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {errors.capacity && <p className="text-red-500 text-sm mt-1">{errors.capacity}</p>}
        </div>
      </div>

      {/* Image Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Hình ảnh sự kiện *
        </label>
        
        {/* Image Preview */}
        {imagePreview && (
          <div className="mb-4 relative">
            <img 
              src={imagePreview} 
              alt="Preview" 
              className="w-full h-64 object-cover rounded-lg border-2 border-gray-200"
              onError={() => setImagePreview('')}
            />
            <button
              type="button"
              onClick={() => {
                setImagePreview('');
                setFormData(prev => ({ ...prev, img: '' }));
              }}
              className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors shadow-lg"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* Upload Options */}
        <div className="space-y-3">
          {/* File Upload */}
          <div>
            <label className="block">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors cursor-pointer bg-gray-50 hover:bg-blue-50">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={uploadingImage}
                />
                <div className="space-y-2">
                  {uploadingImage ? (
                    <>
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                      <p className="text-sm text-gray-600">Đang tải ảnh lên...</p>
                    </>
                  ) : (
                    <>
                      <svg className="w-12 h-12 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <div>
                        <p className="text-sm font-medium text-blue-600">Tải ảnh từ máy</p>
                        <p className="text-xs text-gray-500">PNG, JPG, GIF tối đa 2MB</p>
                        <p className="text-xs text-gray-400 mt-1">Ảnh sẽ tự động nén và resize</p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </label>
          </div>

          {/* URL Input */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Hoặc</span>
            </div>
          </div>

          <div>
            <input
              type="url"
              name="img"
              value={formData.img.startsWith('data:') ? '' : formData.img}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Nhập URL hình ảnh: https://example.com/image.jpg"
              disabled={uploadingImage}
            />
          </div>
        </div>

        {errors.img && <p className="text-red-500 text-sm mt-2">{errors.img}</p>}
      </div>

      {/* Status */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Trạng thái
        </label>
        <select
          name="status"
          value={formData.status}
          onChange={handleChange}
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="draft">Nháp</option>
          <option value="published">Đã xuất bản</option>
          <option value="cancelled">Đã hủy</option>
        </select>
      </div>

      {/* Ticket Types */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <label className="block text-sm font-medium text-gray-700">
            Loại vé *
          </label>
          <button
            type="button"
            onClick={addTicketType}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            + Thêm loại vé
          </button>
        </div>

        {formData.ticketTypes.map((ticket: TicketType, index: number) => (
          <div key={index} className="border rounded-lg p-4 mb-4">
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-medium">Loại vé #{index + 1}</h4>
              {formData.ticketTypes.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeTicketType(index)}
                  className="text-red-600 hover:text-red-700 text-sm"
                >
                  Xóa
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Tên loại vé</label>
                <input
                  type="text"
                  value={ticket.name}
                  onChange={(e) => handleTicketTypeChange(index, 'name', e.target.value)}
                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                  placeholder="VD: VIP, General"
                />
                {errors[`ticketType_${index}_name`] && (
                  <p className="text-red-500 text-xs mt-1">{errors[`ticketType_${index}_name`]}</p>
                )}
              </div>

              <div>
                <label className="block text-xs text-gray-600 mb-1">Giá (VNĐ)</label>
                <input
                  type="number"
                  value={ticket.price}
                  onChange={(e) => handleTicketTypeChange(index, 'price', e.target.value)}
                  min="0"
                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                />
                {errors[`ticketType_${index}_price`] && (
                  <p className="text-red-500 text-xs mt-1">{errors[`ticketType_${index}_price`]}</p>
                )}
              </div>

              <div>
                <label className="block text-xs text-gray-600 mb-1">Số lượng</label>
                <input
                  type="number"
                  value={ticket.available}
                  onChange={(e) => handleTicketTypeChange(index, 'available', e.target.value)}
                  min="0"
                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                />
                {errors[`ticketType_${index}_available`] && (
                  <p className="text-red-500 text-xs mt-1">{errors[`ticketType_${index}_available`]}</p>
                )}
              </div>

              <div>
                <label className="block text-xs text-gray-600 mb-1">Giới hạn mua</label>
                <input
                  type="number"
                  value={ticket.purchaseLimit}
                  onChange={(e) => handleTicketTypeChange(index, 'purchaseLimit', e.target.value)}
                  min="1"
                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        ))}
        {errors.ticketTypes && <p className="text-red-500 text-sm mt-1">{errors.ticketTypes}</p>}
      </div>

      {/* Submit Buttons */}
      <div className="flex justify-end space-x-4">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            disabled={isLoading}
          >
            Hủy
          </button>
        )}
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Đang xử lý...' : event ? 'Cập nhật' : 'Tạo sự kiện'}
        </button>
      </div>

      {/* Error Messages */}
      {(createMutation.isError || updateMutation.isError) && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700 text-sm">
            {(createMutation.error as any)?.response?.data?.message || 
             (updateMutation.error as any)?.response?.data?.message || 
             'Có lỗi xảy ra. Vui lòng thử lại.'}
          </p>
        </div>
      )}
    </form>
  );
};

export default EventForm;
