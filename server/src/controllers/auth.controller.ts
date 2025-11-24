import { Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { User } from '../models/User'
import { sendEmail } from '../utils/email'

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({
        status: 'error',
        message: 'Email đã được sử dụng',
      })
    }

    // Create new user
    const user = await User.create({
      email,
      password,
      name,
    })

    // Generate token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || 'your_jwt_secret',
      {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
      }
    )

    // Send welcome email
    await sendEmail({
      to: user.email,
      subject: 'Chào mừng bạn đến với TicketHub',
      text: `Xin chào ${user.name},\n\nChúc mừng bạn đã đăng ký thành công tài khoản TicketHub.\n\nTrân trọng,\nĐội ngũ TicketHub`,
    })

    res.status(201).json({
      status: 'success',
      data: {
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
        token,
      },
    })
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    })
  }
}

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body

    // Check if user exists
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'Email hoặc mật khẩu không đúng',
      })
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password)
    if (!isPasswordValid) {
      return res.status(401).json({
        status: 'error',
        message: 'Email hoặc mật khẩu không đúng',
      })
    }

    // Generate token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || 'your_jwt_secret',
      {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
      }
    )

    res.status(200).json({
      status: 'success',
      data: {
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
        token,
      },
    })
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    })
  }
}

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body

    // Check if user exists
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'Không tìm thấy tài khoản với email này',
      })
    }

    // Generate reset token
    const resetToken = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || 'your_jwt_secret',
      {
        expiresIn: '1h',
      }
    )

    // Send reset password email
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`
    await sendEmail({
      to: user.email,
      subject: 'Đặt lại mật khẩu TicketHub',
      text: `Xin chào ${user.name},\n\nBạn đã yêu cầu đặt lại mật khẩu. Vui lòng click vào link sau để đặt lại mật khẩu:\n\n${resetUrl}\n\nLink này sẽ hết hạn sau 1 giờ.\n\nNếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.\n\nTrân trọng,\nĐội ngũ TicketHub`,
    })

    res.status(200).json({
      status: 'success',
      message: 'Email đặt lại mật khẩu đã được gửi',
    })
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    })
  }
}

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, password } = req.body

    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'your_jwt_secret'
    ) as { id: string }

    // Update password
    const user = await User.findById(decoded.id)
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'Token không hợp lệ hoặc đã hết hạn',
      })
    }

    user.password = password
    await user.save()

    res.status(200).json({
      status: 'success',
      message: 'Mật khẩu đã được đặt lại thành công',
    })
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message:
        error.name === 'JsonWebTokenError'
          ? 'Token không hợp lệ hoặc đã hết hạn'
          : error.message,
    })
  }
} 