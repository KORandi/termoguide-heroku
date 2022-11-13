/**
 * @param {string} timestamp
 * @param {string} interval
 * @param {string} limit
 * @returns {object[]}
 */
export const getGroupedByTimeQuery = (timestamp, interval, limit) => [
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
      _id: 1,
    },
  },
  {
    $limit: Number(limit),
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
      average: {
        $avg: "$val",
      },
      min: {
        $min: "$val",
      },
      max: {
        $max: "$val",
      },
      length: {
        $count: {},
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
];
