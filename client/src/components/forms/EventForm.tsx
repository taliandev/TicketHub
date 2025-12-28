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
    img: event?.img || 'https://via.placeholder.com/800x400.png?text=Event+Image',
    capacity: event?.capacity || 100,
    status: event?.status || 'draft',
    ticketTypes: event?.ticketTypes || [
      { name: 'General', price: 0, available: 100, purchaseLimit: 10 }
    ]
  });

  const [errors, setErrors] = useState<any>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (errors[name]) {
      setErrors((prev: any) => ({ ...prev, [name]: '' }));
    }
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

      {/* Image URL */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          URL hình ảnh *
        </label>
        <input
          type="url"
          name="img"
          value={formData.img}
          onChange={handleChange}
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="https://example.com/image.jpg"
        />
        {errors.img && <p className="text-red-500 text-sm mt-1">{errors.img}</p>}
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
