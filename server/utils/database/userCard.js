var userCardModel = require('../../models/v3/userCard');
const userStatistics = require('./userStatistics');
exports.findOneAndUpdate = async function (conditions, update) {
    let options = {
        upsert: false
    }
    return await userCardModel.findOneAndUpdate(conditions, update, options);
}
exports.findUserCard = async function (filters, pageSize = 20, page = 1, sort = {}, match = {}) {
    let totalCount = 0;
    let results = [];
    const query = await userCardModel.aggregate([
        { $match: filters },
        { $unwind: "$cardList" },
        { $match: match },
        {
            $sort: sort
        },
    ]);
    totalCount = query.length;//--GEt total count here
    if (page !== -1) {
        results = query.slice((page - 1) * pageSize, (page - 1) * pageSize + pageSize);
    } else {
        results = query;
    }
    // console.log(count);
    // 如果空返回[]，如果有值返回[ [ cardList: [...] , pageInfo{...} ] ]
    return { cardList: results, cardCount: totalCount };
}
exports.findAndCountUserCard = async function (filters, pageSize = 20, page = 1, sort = {}, match = {}) {
    let totalCount = 0;
    let results = [];
    const query = await userCardModel.aggregate([
        { $match: filters },
        { $unwind: "$cardList" },
        {
            $group: {
                _id: "$cardList.cardID",
                count: {
                    $sum: 1
                },
                isSparkle: {
                    $sum: { $cond: ["$cardList.isSparkle", 1, 0] }
                },
                cardID: { "$first": "$cardList.cardID" }
            }
        },
        {
            $lookup: {
                "from": "v3gamecarddatas",
                "localField": "cardID",
                "foreignField": "_id",
                "as": "cardData"
            }
        },
        { $unwind: "$cardData" },
        { $match: match },
        {
            $sort: sort
        },
        // { $skip: (page - 1) * pageSize },
        // { $limit: pageSize },
    ]);
    totalCount = query.length;//--GEt total count here
    if (page !== -1) {
        results = query.slice((page - 1) * pageSize, (page - 1) * pageSize + pageSize);
    } else {
        results = query;
    }
    // console.log(count);
    // 如果空返回[]，如果有值返回[ [ cardList: [...] , pageInfo{...} ] ]
    return { cardList: results, cardCount: totalCount };
}
// cardIndexCountId 更新卡牌统计的数据表ID
exports.updateOne = async function (filters, parmas, cardIndexCountId = null) {
    // document查询
    const dataRes = await userCardModel.updateOne(filters, parmas);
    if (cardIndexCountId) {
        const count = await userCardModel.aggregate([
            { $match: filters },
            { $unwind: "$cardList" },
            {
                $group: {
                    _id: "$cardList.cardID",
                    count: {
                        $sum: 1
                    }
                }
            }
        ])
        const cardIdCount = count.length;
        // 记得验证是否是用户的卡牌统计
        // console.log(count);
        await userStatistics.updateOne({ _id: cardIndexCountId }, { cardIndexCount: cardIdCount });
    }
    return dataRes;
}
exports.findOne = async function (parmas) {
    return await userCardModel.findOne(parmas);
}
exports.findByHandBook = async function (parmas, cardIDList) {
    const query = await userCardModel.aggregate([
        { $match: parmas },
        { $unwind: "$cardList" },
        { $match: { "cardList.cardID": { $in: cardIDList } } },
        {
            $group: {
                _id: "$cardList.cardID",
                count: {
                    $sum: 1
                },
                isSparkle: {
                    $sum: { $cond: ["$cardList.isSparkle", 1, 0] }
                },
                cardID: { "$first": "$cardList.cardID" }
            }
        }
    ]);
    return query;
}
exports.save = async function (parmas) {
    // document作成
    var newData = new userCardModel(parmas);
    // document保存
    return await newData.save()
}