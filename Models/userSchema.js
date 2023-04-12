const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
		},
		phone: {
			type: Number,
		},
		password: {
			type: String,
		},
		email: {
			type: String,
		},
		userType: {
			type: String,
		},
		code: {
			type: String,
		},
		userActiveStatus: {
			type: String,
			default: 'Active',
		},
		emailStatus: {
			type: String,
			default: 'Not Verified',
		},
		userSellerStatus: {
			type: String,
			default: 'Pending',
		},
		userBuyerStatus: {
			type: String,
			default: 'Pending',
		},
		imageUrl: {
			type: String,
			default: '',
		},
		stripeId: {
			type: String,
			default:""
		},
		externalAccountConnected: {
			type: Boolean,
			default:false
		},
	},
	{
		timestamps: true,
	},
);

export default mongoose.model('User', userSchema);
