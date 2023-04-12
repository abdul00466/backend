import express from 'express';
import multer from 'multer';
import user from '../Controllers/user';
// auth middleware for user
import isLoggedInUser from '../Middlewares/loggedIn';

const storage = multer.memoryStorage();
const upload = multer({
	storage,
});

const userRouter = express.Router();

userRouter.get('/', isLoggedInUser.isLoggedIn, user.getSingleUser);
userRouter.get('/getallusers', isLoggedInUser.isLoggedIn, user.getUsers);
userRouter.post('/edituser/:id', upload.single('imageUrl'), user.editUser);

userRouter.post('/resetpassword', isLoggedInUser.isLoggedIn, user.resetPassword);
userRouter.post('/forgotpassword', user.forgotPass);
userRouter.post('/editpassword', user.editPass);
//userRouter.get('/test', user.test);

userRouter.post('/addbank', isLoggedInUser.isLoggedIn, user.addBank);
userRouter.post('/sendverificationemail', user.sendVerificationEmail);
userRouter.post('/sendupdateemail', user.sendAccountUpdateEmail);

export default userRouter;
