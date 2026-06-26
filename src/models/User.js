import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    passwordHash: {
        type: String,
        required: true,
        select: false,
    },
});

userSchema.statics.createUser = async function (username, plaintextPassword) {
    const passwordHash = await bcrypt.hash(plaintextPassword, 10);
    return this.create({ username, passwordHash });
};

userSchema.methods.verifyPassword = async function (plaintextPassword) {
    return bcrypt.compare(plaintextPassword, this.passwordHash);
};

export default mongoose.model('User', userSchema);
