/**
 * @param {string} limit
 * @param {string} interval
 * @returns {object[]}
 */
const UpSamplingSubquery = (limit, interval) => {
  if (Number(interval) >= 300000) {
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
                      val: "$$this.current.val",
                      date: {
                        $toDate: {
                          $add: [
                            {
                              $toLong: "$$this.current.date",
                            },
                            {
                              $multiply: ["$$mapVal", 60000],
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
        length: {
          $size: "$data",
        },
      },
    },
    {
      $limit: Number(limit),
    },
  ];
};

/**
 * @param {string | 0} timestamp
 * @param {string} interval
 * @param {string} limit
 * @returns {object[]}
 */
export const getGroupedByTimeQuery = (timestamp, interval, limit) =>
  [
    {
      $match: {
        timestamp: { $gte: new Date(Number(timestamp)) },
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
                  Number(interval),
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
      $limit: Number(limit),
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
