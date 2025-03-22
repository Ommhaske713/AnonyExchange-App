import mongoose, { Schema, Document } from 'mongoose';

export interface Message extends Document {
  content: string;
  createdAt: Date;
  _id: string;
  reply?: string;
  repliedAt?: Date;
  username?: string;
  isRead?: boolean;
  notificationsEnabled?:boolean
}

const MessageSchema: Schema<Message> = new mongoose.Schema({
  content: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    required: true,
    default: Date.now,
  },
  reply: {
    type: String,
    default: null
  },
  repliedAt: {
    type: Date,
    default: null
  },
  isRead: {  
    type: Boolean,
    default: false
  },
  notificationsEnabled:{
    type:Boolean,
    default:true
  }
});

export interface NotificationStatusChange {
  enabled: boolean;
  timestamp: Date;
}

export interface User extends Document {
  username: string;
  email: string;
  password: string;
  verifyCode?: string; 
  verifyCodeExpiry?: Date; 
  isVerified: boolean;
  isAcceptingMessages: boolean;
  showQuestions: boolean; 
  notificationStatusChanges: NotificationStatusChange[];
  messages: Message[];
}

const UserSchema: Schema<User> = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    trim: true,
    unique: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    match: [/.+\@.+\..+/, 'Please use a valid email address'],
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
  },
  verifyCode: {
    type: String,
    required: false
  },
  verifyCodeExpiry: {
    type: Date,
    required: false
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  isAcceptingMessages: {
    type: Boolean,
    default: true,
  },
  showQuestions: {
    type: Boolean,
    default: true,  
  },
  notificationStatusChanges: [
    {
      enabled: Boolean,
      timestamp: {
        type: Date,
        default: Date.now
      }
    }
  ],
  messages: [MessageSchema]
});

const UserModel =
  (mongoose.models.User as mongoose.Model<User>) ||
  mongoose.model<User>('User', UserSchema);

export default UserModel;