var usersModel = require('../models/users');
var utils = require('../utils/utils');
var md5 = require('md5-node');
module.exports = function(req, res, next){
    console.log(req.body.email);
    if(req.body.email){
        var userEmail = req.body.email.toLowerCase();
        var sel = Math.floor(req.body.sel);
        //判断选择的卡牌编号是否有误
        if(isNaN(sel)||sel<0||sel>2){
            res.send({
                code:0,
                msg:'参数有误！'
            });
            console.log('参数有误！');
            return false;
        }
        //验证邮箱格式
        if(utils.emailCheck(userEmail)){
            // document查询
            usersModel.findOne({ email: userEmail }, function(err, result) {
                if (err) {
                    throw err;
                }else{
                    console.log(result);
                    //判断是否有该用户
                    if(result){
                        let IP = utils.getUserIp(req);
                        //循环三张牌
                        let cardIdArr = [];
                        while (cardIdArr.length<3){
                            let rareNum = utils.randomNum(1,100);
                            cardIdArr.push(utils.wmCreatCardId(rareNum));
                            utils.unique(cardIdArr);
                        }

                        let cardId = cardIdArr[sel];
                        console.log(cardIdArr);
                        if(cardId===undefined||cardId===null){
                            res.send({
                                code:0,
                                msg:'数据错误！'
                            });
                            console.log('数据错误！');
                            return false;
                        }
                        let cardDataBase = {};
                        //判断是否有卡牌信息
                        if(result.card){
                            cardDataBase = result.card;
                            //判断是否已经拥有该卡
                            if(cardDataBase[cardId]){
                                cardDataBase[cardId] = cardDataBase[cardId]+1;
                            }else{
                                cardDataBase[cardId] = 1;
                            }
                        }else{
                            cardDataBase[cardId] = 1;
                        }
                        usersModel.updateOne({email: userEmail}, {card: cardDataBase,ip:IP}, function(err, docs){
                            if(err) {
                                throw err;
                            }else{
                                console.log('更改成功!');
                            }
                        })
                        res.send({
                            code:1,
                            cardChoiseList:cardIdArr,
                            choiseIndex:sel,
                            emailmd5:md5(userEmail),
                            card:cardId,
                            msg:'ok'
                        });
                    }else{
                        res.send({
                            code:2,
                            msg:'该邮箱未注册！'
                        });
                    }
                }
            });
        }else{
            res.send({
                code:0,
                msg:'邮箱地址格式有误！'
            });
        }
    }else{
        res.send({
            code:0,
            msg:'邮箱地址不能为空！'
        });
    }
}