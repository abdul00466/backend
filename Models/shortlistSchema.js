import mongoose from 'mongoose';

const ShortlistSchema = new mongoose.Schema(
	{
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'users'},
        propertyId: { type: mongoose.Schema.Types.ObjectId, ref: 'properties'},
	},
	{
		timestamps: true,
	},
);

export default mongoose.model('Shortlist', ShortlistSchema);
