/**
 * @param {Number} limit
 * @param {Number} interval
 * @returns {object[]}
 */
const UpSamplingSubquery = (limit, interval) => {
  if (interval > 60000) {
    return [];
  }
  return [
    {
      $project: {
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
    {
      $project: {
        data: {
          $setDifference: ["$data", [{ $last: "$data" }]],
        },
      },
    },
    {
      $project: {
        data: {
          $slice: [
            {
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
            -1 * limit,
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
  ];
};

/**
 * @param {Number} timestamp
 * @param {Number} interval
 * @param {Number} limit
 * @returns {object[]}
 */
export const getGroupedByTimeQuery = (timestamp, interval, limit) =>
  [
    {
      $match: {
        timestamp: { $gte: new Date(timestamp) },
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
    ...UpSamplingSubquery(limit, interval),
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
