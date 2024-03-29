import bcryptjs from 'bcryptjs';
import status from 'http-status';
import Model from '../Models/Model';
import awsHandler from './aws';
const sgMail = require('@sendgrid/mail');
const mongoose = require('mongoose');

async function addProperty  (req, res, next)  {
	
    const { propertyTitle, description , area, propertyType, address, city, state, zip, country, bedrooms, bathrooms, floors, priceDemand, biddingEnd, estCompletion , paymentPlan , amenities , downPayment,constructionTimePayment,handoverPayment} = req.body;
	const imagesArray = [];

		if (req.files.length > 0) {

			await req.files.map(async(file, index) => {
				const imageUrl = await awsHandler.UploadToAws(file);
				imagesArray.push(imageUrl);

				if (req.files.length  === imagesArray.length) {
					console.log(imagesArray);

					const event =  new Model.PropertyModel({
                        userId: req.user._id,
						propertyTitle,
                        description,
                        area,
                        propertyType,
						address,
						city,
						state,
						zip,
						country,
                        bedrooms,
                        bathrooms,
                        floors,
                        priceDemand,
                        biddingStart: Date.now(),
                        biddingEnd,
						estCompletion,
						paymentPlan,
						amenities,
						images: imagesArray,
						downPayment,
						constructionTimePayment,
						handoverPayment
					});
					event
						.save()
						.then(savedEvent => {
							res.status(status.OK).send({
								savedEvent,
								Message: 'Property Added Successfully',
								type: status.Ok,
							});
						})
						.catch(err => {
							res.status(status.INTERNAL_SERVER_ERROR).send({
								Message: status.INTERNAL_SERVER_ERROR,
								err,
							});
						});				
																
					
		}
	})
		} else {
			res.status(500).send('Cant upload image');
		}
};

const getProperties = (req, res) => {
	Model.PropertyModel.find()
		.then(events => {
			res.status(status.OK).send(events);
		})
		.catch(err => {
			res.status(status.INTERNAL_SERVER_ERROR).send({
				Message: 'No Events!',
				err,
			});
		});
};


const deleteProperty = (req, res) => {
	const { id } = req.params;
	Model.PropertyModel.findByIdAndRemove(id, (err, result) => {
		if (result) {
			res.status(status.OK).send({
				Message: 'Property Deleted Successfully.',
			});
		} else {
			res.status(status.INTERNAL_SERVER_ERROR).send({
				Message: 'Unable to Delete.',
				err,
			});
		}
	});
};


const editProperty = (req, res) => {
	const { id } = req.params;
	const query = { $set: req.body };
	Model.PropertyModel.findByIdAndUpdate(id, query, { new: true }, (err, result) => {
		if (err) {
			res.status(status.INTERNAL_SERVER_ERROR).send({
				Message: 'Unable to Update.',
			});
		} else {
			res.status(status.OK).send({
				Message: 'Successfully Updated.',
				result,
			});
		}
	});
};

const getSingleProperty = (req, res) => {
	const { eid } = req.params;

	Model.PropertyModel.findOne({ _id: eid })
		.then(event => {
			if (!event) {
				return res.status(status.NOT_FOUND).send({
					Message: 'Boat not found',
				});
			}
			return res.status(status.OK).send(event);
		})
		.catch(err => {
			return res.status(status.INTERNAL_SERVER_ERROR).send({
				Message: 'Internal Server Error',
				err,
			});
		});
};

const getUserProperties = (req, res) => {
	Model.PropertyModel.find({userId: req.user._id})
		.then(events => {
			res.status(status.OK).send(events);
		})
		.catch(err => {
			res.status(status.INTERNAL_SERVER_ERROR).send({
				Message: 'No Events!',
				err,
			});
		});
};

const priceFilter = (req, res) => {
	console.log("here");
	Model.PropertyModel.find({priceDemand: {$gte: req.body.startPrice, $lte: req.body.endPrice}}).sort({priceDemand:1})
		.then(events => {
			res.status(status.OK).send(events);
		})
		.catch(err => {
			res.status(status.INTERNAL_SERVER_ERROR).send({
				Message: 'No Events!',
				err,
			});
		});
};

const filterProperties = (req, res) => {
	console.log("body" , req.body)
	Model.PropertyModel.find(req.body)
		.then(events => {
			res.status(status.OK).send(events);
		})
		.catch(err => {
			res.status(status.INTERNAL_SERVER_ERROR).send({
				Message: 'No Events!',
				err,
			});
		});
};

// oldest to newest
const sortAscending = (req, res) => {
	console.log("body" , req.body)
	Model.PropertyModel.find().sort({"created_at": 1})
		.then(events => {
			res.status(status.OK).send(events);
		})
		.catch(err => {
			res.status(status.INTERNAL_SERVER_ERROR).send({
				Message: 'No Events!',
				err,
			});
		});
};

// newest to oldest
const sortDescending = (req, res) => {
	console.log("body" , req.body)
	Model.PropertyModel.find().sort({"_id": -1})
		.then(events => {
			res.status(status.OK).send(events);
		})
		.catch(err => {
			res.status(status.INTERNAL_SERVER_ERROR).send({
				Message: 'No Events!',
				err,
			});
		});
};

const sortPriceDescending = (req, res) => {

	Model.PropertyModel.find().sort({"priceDemand": -1})
		.then(events => {
			res.status(status.OK).send(events);
		})
		.catch(err => {
			res.status(status.INTERNAL_SERVER_ERROR).send({
				Message: 'No Events!',
				err,
			});
		});
};

const sortPriceAscending = (req, res) => {
	
	Model.PropertyModel.find().sort({"priceDemand": 1})
		.then(events => {
			res.status(status.OK).send(events);
		})
		.catch(err => {
			res.status(status.INTERNAL_SERVER_ERROR).send({
				Message: 'No Events!',
				err,
			});
		});
};

const searchProperty = (req, res) => {
	console.log("body" , req.body)
	let query = {};
        if (req.body.propertyTitle !== undefined) {
            query = {
                propertyTitle: new RegExp(req.body.propertyTitle, 'i')
            };
        }

		console.log("query" , query)
	Model.PropertyModel.find(query )
		.then(events => {
			res.status(status.OK).send(events);
		})
		.catch(err => {
			res.status(status.INTERNAL_SERVER_ERROR).send({
				Message: 'No Events!',
				err,
			});
		});
};

const counts = (req, res) => {
	
	Model.PropertyModel.count()
		.then(events => {
			console.log("res" , events)
			//res.status(status.OK).send(events);

			Model.BiddingModel.count()
			.then(events2 => {
				console.log("res" , events2)
				res.status(status.OK).send({properties:events , biddings:events2});
			})
			.catch(err => {
				res.status(status.INTERNAL_SERVER_ERROR).send({
					Message: 'No Events!',
					err,
				});
			});
		})
		// .catch(err => {
		// 	res.status(status.INTERNAL_SERVER_ERROR).send({
		// 		Message: 'No Events!',
		// 		err,
		// 	});
		// });
};

const sellerCounts = (req, res) => {
	console.log("usre" , req.user)
	Model.PropertyModel.find({userId:req.user._id}).count()
		.then(events => {
			console.log("res" , events)
			//res.status(status.OK).send(events);

			Model.BiddingModel.find({sellerId:req.user._id}).count()
			.then(events2 => {
				console.log("res" , events2)
				res.status(status.OK).send({properties:events , biddings:events2});
			})
			.catch(err => {
				res.status(status.INTERNAL_SERVER_ERROR).send({
					Message: 'No Events!',
					err,
				});
			});
		})
};

const sellergraph = (req, res) => {
	let id = mongoose.Types.ObjectId(req.user._id);
	Model.BiddingModel.find({sellerId:id , winner:true}).sort({"_id":-1})
		.then(events => {
			console.log("events" , events)
			res.status(status.OK).send(events);
		})
		.catch(err => {
			res.status(status.INTERNAL_SERVER_ERROR).send({
				Message: 'No Events!',
				err,
			});
		});
};

const sellerCounts2 = (req, res) => {
	console.log("usre" , req.user)
	Model.PropertyModel.find({userId:req.user._id , status:"Sold"}).count()
		.then(events => {
			console.log("res" , events)
			//res.status(status.OK).send(events);

			Model.PropertyModel.find({userId:req.user._id , status:"On Auction"}).count()
			.then(events2 => {
				console.log("res" , events2)
				res.status(status.OK).send({SoldProperties:events , Pending:events2});
			})
			.catch(err => {
				res.status(status.INTERNAL_SERVER_ERROR).send({
					Message: 'No Events!',
					err,
				});
			});
		})
};

const sellergraph2 = (req, res) => {
	console.log("usre" , req.body.propertyId)

	if(req.body.propertyId != null){
		console.log("hereeee")
		let property_id = mongoose.Types.ObjectId(req.body.propertyId);

		Model.BiddingModel.find({propertyId:property_id, 
			createdAt: {
			$gte: new Date(req.body.startDate), $lte:new Date(req.body.endDate)
		}
	}).count()
		.then(events2 => {
			res.status(status.OK).send({totalBids:events2});
		})
		.catch(err => {
			res.status(status.INTERNAL_SERVER_ERROR).send({
				Message: 'No Events!',
				err,
			});
		});
	}
	else {
	Model.BiddingModel.find({sellerId:req.user._id , createdAt: {
        $gte: new Date(new Date() - 7 * 60 * 60 * 24 * 1000)
    }}).count()
	.then(events2 => {
		res.status(status.OK).send({totalBids:events2 , time:"Last Week"});
	})
	.catch(err => {
		res.status(status.INTERNAL_SERVER_ERROR).send({
			Message: 'No Events!',
			err,
		});
	});
}
};

const addShortlist = (req, res) => {
	const { propertyId } = req.body;

	const event = new Model.ShortlistModel({
		userId:req.user._id,
		propertyId,
	});
	event
		.save()
		.then(savedEvent => {
			res.status(status.OK).send({
				savedEvent,
				Message: 'Property Shortlistedd Successfully',
				type: status.Ok,
			});
		})
		.catch(err => {
			res.status(status.INTERNAL_SERVER_ERROR).send({
				Message: status.INTERNAL_SERVER_ERROR,
				err,
			});
		});
};

const getShortlist = (req, res) => {
	try{
	Model.ShortlistModel.aggregate([
        //$match: { "_id": mongoose.Types.ObjectId("606c1ceb362b366a841171dc") }
        //{ "$match": { "propertyId": id }},

        { 
            "$lookup": { 
                "from": 'properties', 
                "localField": 'propertyId', 
                "foreignField": '_id', 
                "as": 'Property' 
            } 
        },
     
    ]).then(events => {
            console.log("eventttt" , events)
            res.status(status.OK).send(events);
        })
        .catch(err => {
            res.status(status.INTERNAL_SERVER_ERROR).send({
                Message: 'No Events!',
                err,
            });
        });
    }
    catch(err){
        res.send(err)
    }

};
const getShortlistUser = (req, res) => {
	try{
		let id = mongoose.Types.ObjectId(req.user._id);

		Model.ShortlistModel.aggregate([
			//$match: { "_id": mongoose.Types.ObjectId("606c1ceb362b366a841171dc") }
			{ "$match": { "userId": id }},
	
			{ 
				"$lookup": { 
					"from": 'properties', 
					"localField": 'propertyId', 
					"foreignField": '_id', 
					"as": 'Property' 
				} 
			},
		 
		]).then(events => {
				console.log("eventttt" , events)
				res.status(status.OK).send(events);
			})
			.catch(err => {
				res.status(status.INTERNAL_SERVER_ERROR).send({
					Message: 'No Events!',
					err,
				});
			});
		}
		catch(err){
			res.send(err)
		}
};

const deleteShortlist = (req, res) => {
	const { id } = req.params;
	Model.ShortlistModel.findByIdAndRemove(id, (err, result) => {
		if (result) {
			res.status(status.OK).send({
				Message: 'Property Removed Successfully.',
			});
		} else {
			res.status(status.INTERNAL_SERVER_ERROR).send({
				Message: 'Unable to Delete.',
				err,
			});
		}
	});
};
export default { getProperties, addProperty, deleteProperty, editProperty, getSingleProperty , getUserProperties , priceFilter , filterProperties  , sortAscending , sortDescending , sortPriceDescending , sortPriceAscending , searchProperty , counts , sellerCounts , sellergraph , sellergraph2 , sellerCounts2, addShortlist, getShortlist, getShortlistUser, deleteShortlist};
