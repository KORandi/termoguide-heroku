import mongoose from "mongoose";

/**
 * @param {object} props
 * @param {Number} props.timestamp
 * @param {Number} props.interval
 * @param {'temperatures' | 'humidities'} props.type
 * @returns {object[]}
 */
const getPreviousValue = ({ timestamp, interval, type }) => {
  if (timestamp <= 0) {
    return [];
  }

  return [
    {
      $lookup: {
        from: type,
        as: "temp",
        pipeline: [
          {
            $match: {
              timestamp: {
                $lte: new Date(timestamp),
              },
            },
          },
          {
            $sort: {
              timestamp: -1,
            },
          },
          {
            $limit: 1,
          },
          {
            $group: {
              _id: {
                $toDate: {
                  $subtract: [
                    {
                      $toLong: "$timestamp",
                    },
                    {
                      $mod: [
                        {
                          $toLong: "$timestamp",
                        },
                        interval,
                      ],
                    },
                  ],
                },
              },
              val: {
                $avg: "$value",
              },
            },
          },
          {
            $set: {
              date: "$_id",
            },
          },
        ],
      },
    },
    {
      $set: {
        data: {
          $concatArrays: ["$temp", "$data"],
        },
      },
    },
  ];
};

/**
 * @param {object} props
 * @param {Number} props.timestamp
 * @param {Number} props.interval
 * @param {Number} props.limit
 * @param {'temperatures' | 'humidities'} props.type
 * @returns {object[]}
 */
const upSamplingSubquery = ({ timestamp, limit, interval, type }) => {
  if (interval > 60000) {
    return [];
  }
  return [
    ...getPreviousValue({ timestamp, interval, type }),
    {
      $set: {
        data: {
          $reduce: {
            input: { $range: [0, { $size: "$data" }] },
            initialValue: [],
            in: {
              $concatArrays: [
                "$$value",
                [
                  {
                    current: { $arrayElemAt: ["$data", "$$this"] },
                    next: { $arrayElemAt: ["$data", { $add: ["$$this", 1] }] },
                  },
                ],
              ],
            },
          },
        },
      },
    },
    // Remove last value without next index
    {
      $set: {
        data: {
          $setDifference: ["$data", [{ $last: "$data" }]],
        },
      },
    },
    {
      $set: {
        data: {
          $reduce: {
            input: "$data",
            initialValue: [],
            in: {
              $concatArrays: [
                "$$value",
                {
                  $map: {
                    input: {
                      $range: [
                        1,
                        {
                          $abs: {
                            $dateDiff: {
                              startDate: "$$this.next.date",
                              endDate: "$$this.current.date",
                              unit: "minute",
                            },
                          },
                        },
                      ],
                    },
                    as: "mapVal",
                    in: {
                      val: {
                        $add: [
                          "$$this.current.val",
                          {
                            $multiply: [
                              {
                                $divide: [
                                  {
                                    $subtract: [
                                      "$$this.next.val",
                                      "$$this.current.val",
                                    ],
                                  },
                                  {
                                    $abs: {
                                      $dateDiff: {
                                        startDate: "$$this.next.date",
                                        endDate: "$$this.current.date",
                                        unit: "minute",
                                      },
                                    },
                                  },
                                ],
                              },
                              "$$mapVal",
                            ],
                          },
                        ],
                      },
                      date: {
                        $toDate: {
                          $add: [
                            {
                              $toLong: "$$this.current.date",
                            },
                            {
                              $multiply: ["$$mapVal", interval],
                            },
                          ],
                        },
                      },
                    },
                  },
                },
                ["$$this.next"],
              ],
            },
          },
        },
      },
    },
    {
      $set: {
        data: {
          $slice: [
            {
              $filter: {
                as: "x",
                cond: { $gte: ["$$x.date", new Date(timestamp)] },
                input: "$data",
              },
            },
            timestamp ? limit : -1 * limit,
          ],
        },
      },
    },
    {
      $set: {
        length: {
          $size: "$data",
        },
      },
    },
  ].filter((e) => e);
};

/**
 * @param {object} props
 * @param {Number} props.timestamp
 * @param {Number} props.interval
 * @param {Number} props.limit
 * @param {String} props.gatewayId
 * @param {'temperatures' | 'humidities'} props.type
 * @returns {object[]}
 */
export const getGroupedByTimeQuery = ({
  timestamp,
  interval,
  limit,
  type,
  gatewayId,
}) =>
  [
    {
      $match: {
        timestamp: { $gte: new Date(timestamp) },
        gateway: new mongoose.Types.ObjectId(gatewayId),
      },
    },
    {
      $group: {
        _id: {
          $toDate: {
            $subtract: [
              {
                $toLong: "$timestamp",
              },
              {
                $mod: [
                  {
                    $toLong: "$timestamp",
                  },
                  interval,
                ],
              },
            ],
          },
        },
        val: {
          $avg: {
            $toDecimal: "$value",
          },
        },
      },
    },
    {
      $sort: {
        _id: timestamp === 0 ? -1 : 1,
      },
    },
    {
      $limit: limit,
    },
    {
      $sort: {
        _id: 1,
      },
    },
    {
      $project: {
        date: "$_id",
        val: 1,
      },
    },
    {
      $group: {
        _id: 1,
        data: {
          $push: "$$ROOT",
        },
        length: {
          $count: {},
        },
      },
    },
    ...upSamplingSubquery({ timestamp, limit, interval, type }),
    {
      $project: {
        _id: 1,
        length: 1,
        data: 1,
        average: {
          $avg: "$data.val",
        },
        min: {
          $min: "$data.val",
        },
        max: {
          $max: "$data.val",
        },
      },
    },
    {
      $set: {
        variance: {
          $divide: [
            {
              $reduce: {
                input: "$data",
                initialValue: 0,
                in: {
                  $add: [
                    "$$value",
                    {
                      $pow: [
                        {
                          $subtract: ["$$this.val", "$average"],
                        },
                        2,
                      ],
                    },
                  ],
                },
              },
            },
            "$length",
          ],
        },
      },
    },
    {
      $set: {
        coefficientOfVariation: {
          $divide: [
            {
              $pow: ["$variance", 0.5],
            },
            "$average",
          ],
        },
      },
    },
    {
      $project: {
        data: 1,
        min: 1,
        max: 1,
        average: 1,
        variance: 1,
        coefficientOfVariation: {
          $multiply: ["$coefficientOfVariation", 100],
        },
      },
    },
  ].filter((e) => e);
