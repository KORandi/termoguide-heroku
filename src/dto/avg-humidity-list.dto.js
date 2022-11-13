import { AvgHumidityRecordDto } from "./avg-humidity-record.dto";

export class AvgHumidityListDto {
  constructor({ min, max, average, data, variance, coefficientOfVariation }) {
    this.min = Number(min);
    this.max = Number(max);
    this.average = Number(average);
    this.variance = Number(variance);
    this.coefficientOfVariation = Number(coefficientOfVariation);
    this.data = data.map((record) => new AvgHumidityRecordDto(record));
  }
}
