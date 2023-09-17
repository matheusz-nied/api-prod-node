import logger from '@src/logger';
import AuthService from '@src/services/auth';
import mongoose, { Document, Model } from 'mongoose';


export interface User {
    _id?: string;
    name: string;
    email: string;
    password: string;
}

export enum CUSTOM_VALIDATION {
    DUPLICATED = 'DUPLICATED',
}

interface UserModel extends Omit<User, '_id'>, Document {}

const schema = new mongoose.Schema<UserModel>(
    {
        name: { type: String, required: true },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        password: { type: String, required: true },
    },
    {
        toJSON: {
            transform: (_, ret): void => {
                ret.id = ret._id;
                delete ret._id;
                delete ret.__v;
            },
        },
    }
);

schema.path('email').validate(
    async (email: string) => {
        const emailtCount = await mongoose.models.User.countDocuments({
            email,
        });
        return !emailtCount;
    },
    'already exists in the database.',
    CUSTOM_VALIDATION.DUPLICATED
);


schema.pre<UserModel>('save', async function (): Promise<void> {
    if (!this.password || !this.isModified('password')) {
        return;
    }
    try {
        const hashedPassword = await AuthService.hashPassword(this.password);
        this.password = hashedPassword;
    } catch (err) {
        logger.error(`Error hashing the password for the user ${this.name}`);
    }
});
export const User: Model<UserModel> = mongoose.model('User', schema);
