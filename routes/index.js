const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const moment=require("moment");
const Booking = require("../models/Booking");


function findConsecutiveGroups(nums, groupSize) {
    nums.sort((a, b) => a - b);
    const result = [];
    
    for (let i = 0; i < nums.length - groupSize + 1; i++) {
        let isConsecutive = true;
        for (let j = 1; j < groupSize; j++) {
            if (nums[i + j] !== nums[i + j - 1] + 1) {
                isConsecutive = false;
                break;
            }
        }      
        if (isConsecutive) {
            result.push(nums.slice(i, i + groupSize));
        }
    }
    
    return result;
}

function removeWithoutCopy(arr, item) {
    for (var i = 0; i< arr.length;i++){
      if(arr[i] === item){
       arr.splice(i,1);
        i--;
     }
    }
    return arr;
}


module.exports=(app)=>{
    const ChosenDate=require("../models/ChosenDate");
    const Booking=require("../models/Booking")
    const Description=require("../models/Description")
    app.use(router)

    app.post('/getAvailableTime',async(req,res)=>{
        var chosenDate=new Date(req.body.date);
        var totalTime=req.body.totalTime;
        // console.log("拿到数据了",chosenDate,totalTime)
       
        let available=true
        let availableTime=[] 
        
        const date=await ChosenDate.findOne({"date":chosenDate})
        if(!date){
            const newDate= await ChosenDate.create({
                date: chosenDate,
                ifAvailable: true,
                period:[0,1,2,3,4,5,6,7,8,9,10]
            })
            let availablePeriods=findConsecutiveGroups([0,1,2,3,4,5,6,7,8,9,10],Math.ceil(totalTime+1))
            if(availablePeriods.length>0){
                for(let period of availablePeriods){
                    availableTime.push(period[0])
                }
            }else{
                available=false
            }
       
        }else{
            let availablePeriods=findConsecutiveGroups(date.period,Math.ceil(totalTime+1))
            if(availablePeriods.length>0){
                for(let period of availablePeriods){
                    availableTime.push(period[0])
                }
            }else{
                available=false
            }        
        }
        const data={
            massage:"success",
            flag:true,
            available:available,
            availableTime:availableTime
        }
        res.send(data)
    })

    app.post("/submitBooking",async(req,res)=>{
        let form= req.body.form
        let chosenTime=req.body.chosenTime
        let chosenDate=new Date(req.body.chosenDate)
        let totalTime=req.body.totalTime
        let checkboxGroup1=req.body.checkboxGroup1
        let checkboxGroup2=req.body.checkboxGroup2
        let checkboxGroup3=req.body.checkboxGroup3

        const booking= await Booking.create({
           date:chosenDate,
           time:chosenTime,
           sedanServices:checkboxGroup1,
           suvServices:checkboxGroup2,
           vanServices:checkboxGroup3,
           firstName:form.firstName,
           lastName:form.lastName,
           phoneNumber:form.phoneNumber,
           email:form.email,
           address:form.address,
           totalTime:totalTime,
           delete:false
        })

        const date= await ChosenDate.findOne({date:chosenDate})
        let period=date.period
        
        for(let i=chosenTime;i<chosenTime+totalTime+1;i++){
            removeWithoutCopy(period,i)
         }

        await ChosenDate.updateOne({date:chosenDate},{period:period})
        res.send({massage:"success",flag:true})
    })

    app.post('/getAllBookings',async(req,res)=>{
        let bookings=await Booking.find({})
        console.log(bookings)
        if(bookings.length!=0){
            console.log("send")
            res.send({
                massage:"success",
                flag:true,
                bookings:bookings
            })
        }else{
            res.send({
                massage:"no booking",
                flag:false
            })
        }
        

    })

    app.post('/getBookingsByMonths',async(req,res)=>{
        let month=req.body.month+1
        let year=req.body.year
        const bookings=await Booking.find({
            $expr: {
                $and: [
                  { $eq: [{ $year: { $toDate: '$date' } }, year] },
                  { $eq: [{ $month: { $toDate: '$date' } }, month] },
                ],
              },
        })
        if(bookings.length!=0){
            // console.log(bookings)
            res.send({
                massage:"success",
                flag:true,
                bookings:bookings
            })
        }else{
            // console.log(bookings)
            res.send({
                massage:"no bookings",
                flag:false
            })
        }
    })

    app.post('/getBookingsByDates',async(req,res)=>{
        let date=new Date(req.body.date)
       
        const bookings=await Booking.find({
           date:date
        })
        if(bookings.length!=0){
   
            res.send({
                massage:"success",
                flag:true,
                bookings:bookings
            })
        }else{
            // console.log(bookings)
            res.send({
                massage:"no bookings",
                flag:false
            })
        }
    })

    app.post('/getBookingsByEmail',async(req,res)=>{
        let email=req.body.email
       
        const bookings=await Booking.find({
           email:email
        })
        if(bookings.length!=0){
    
            res.send({
                massage:"success",
                flag:true,
                bookings:bookings
            })
        }else{
            // console.log(bookings)
            res.send({
                massage:"no bookings",
                flag:false
            })
        }
    })

    app.post('/getBookingsByPhone',async(req,res)=>{
        let phone=req.body.phone
        console.log(phone)
       
        const bookings=await Booking.find({
           phoneNumber:phone
        })
        if(bookings.length!=0){
   
            res.send({
                massage:"success",
                flag:true,
                bookings:bookings
            })
        }else{
            // console.log(bookings)
            res.send({
                massage:"no bookings",
                flag:false
            })
        }
    })


    app.post('/deleteBooking',async(req,res)=>{
        const id=req.body.id
        const booking=await Booking.findOneAndUpdate({_id:id},{delete:true})
        let time=booking.time

        const findeOneDate=await ChosenDate.findOne({date:new Date(booking.date)})
        let period=findeOneDate.period
        // console.log(findeOneDate.totalTime,period,time)      
        for(let i=0;i<Math.ceil(booking.totalTime+1);i++){
            period.push(time)
            time++   
        }
        period.sort(function(a, b){return a - b});
       
        await ChosenDate.updateOne({date:new Date(booking.date)},{period:period})
      
        res.send({
            flag:true
        })
    })

    app.post('/getDescription',async(req,res)=>{
        const title=req.body.title
        const item=await Description.findOne({title:title})

        if(item){
            res.send({
                flag:true,
                description:item.description
            })
        }else{
            res.send({
                flag:false,
                message:"sorry, we cannot show description right now"
            })
        }

    })

    // Description.create({
    //     title:"Regular Detailing",
    //     description:[
    //         "Vacuum Interior (Carpets,  Mats, Seats & Boot )",
    //         "Interior Window Cleaned",
    //         "Dashboard Cleaned",
    //         "Door & Boot Jambs cleaned",
    //         "More Extensive Vacuum On Carpet & Mats using powerful tools",
    //         "Foam Wash Pre-Rinse (Softens excessive dirt & road grime to reduce the risk of scratching the paint)",
    //         "PH Neutral Foam Wash ( Safe For Ceramic Coating )",
    //         "Non-Acidic Wheel Clean",
    //         "Exterior Windows & Body Dried & Waxed",
    //         "Non-Greasy Tyre Shine Applied",
    //     ]
    // })

    // Description.create({
    //     title:"Interior Detailing",
    //     description:[
    //         "Vacuum Interior (Carpets,  Mats, Seats & Boot )",
    //         "Excessive Animal Hair & Sand Removed ",
    //         "Sterilizes the interior with steam to eliminate unwanted germs & bacteria",
    //         "Steam clean Doors",
    //         "Steam clean All Cup-holders, Dashboard & Console.",
    //         "Shampoo & extraction of carpet & seats",
    //         "Shampoo the mats and washed ",
    //         "Lether seats steam cleaned and conditioned",
    //         "Protection to all interior panels ( Dash | Console | Door panels | Cup-holders )",
    //         "Interior Window Cleaned",
    //     ]
    // })

    // Description.create({
    //     title:"Exterior Detailing",
    //     description:[
    //         "Foam Wash Pre-Rinse (Softens excessive dirt & road grime to reduce the risk of scratching the paint)",
    //         "PH Neutral Foam Wash ( Safe For Ceramic Coating )",
    //         "Non-Acidic Wheel Clean & Detailed",
    //         "HAO'S Signature Decontamination Treatment (iron removal with clay bar finish)",
    //         "Exterior Windows & Body Dried",
    //         "Hand or Machine polish",
    //         "Paint enhancement with Hydrophobic & SiO2 coating, which delivers EXTREME  ",
    //         "water beading & chemical resistant protection",
    //         "Plastics & rubbers glossed",
    //         "Non-Greasy Tyre Shine Applied",
    //     ]
    // })

    // Description.create({
    //     title:"Full Detailing",
    //     description:[
    //         "Vacuum Interior (Carpets, Mats, Seats & Boot )",
    //         "Excessive Animal Hair & Sand Removed ",
    //         "Shampoo & extraction of carpet & seats",
    //         "Lether seats cleaned and conditioned",
    //         "Clean all interior panels ( Dash | Console | Door panels | Cup-holders )",
    //         "Interior Window Cleaned",
    //         "Foam Wash Pre-Rinse (Softens excessive dirt & road grime to reduce the risk of scratching the paint)",
    //         "PH Neutral Foam Wash ( Safe For Ceramic Coating )",
    //         "Non-Acidic Wheel Clean & Detailed",
    //         "HAO'S Signature Decontamination Treatment (iron removal with clay bar finish)",
    //         "Exterior Windows & Body Dried",
    //         "Hand or Machine polish",
    //         "Paint enhancement with Hydrophobic & SiO2 coating, which delivers EXTREME  ",
    //         "water beading & chemical resistant protection",
    //         "Plastics & rubbers glossed",
    //         "Non-Greasy Tyre Shine Applied",
    //     ]
    // })

    // Description.create({
    //     title:"Pre-sale Detailing or usedcar buyer's option",
    //     description:[
    //         "Vacuum Interior (Carpets, Mats, Seats & Boot )",
    //         "Excessive Animal Hair & Sand Removed ",
    //         "Sterilizes the interior with steam to eliminate unwanted germs & bacteria",
    //         "Steam clean Doors",
    //         "Steam clean All Cup-holders, Dashboard & Console",
    //         "Shampoo & extraction of carpet & seats",
    //         "Lether seats steam cleaned and conditioned",
    //         "Protection to all interior panels ( Dash | Console | Door panels | Cup-holders )",
    //         "Interior Window Cleaned",
    //         "Foam Wash Pre-Rinse (Softens excessive dirt & road grime to reduce the risk of scratching the paint)",
    //         "PH Neutral Foam Wash ( Safe For Ceramic Coating )",
    //         "Non-Acidic Wheel Clean & Detailed",
    //         "Engine bay cleaned",
    //         "HAO’S Signature Decontamination Treatment (iron removal with clay bar finish)",
    //         "Exterior Windows & Body Dried",
    //         "Hand or Machine polish",
    //         "Paint enhancement with Hydrophobic & SiO2 coating, which delivers EXTREME ",
    //         "water beading & chemical resistant protection",
    //         "Plastics & rubbers glossed",
    //         "Non-Greasy Tyre Shine Applied"
    //     ]
    })

    
}
