import { AvgTemperatureRecordDto } from "./avg-temperature-record.dto";

export class AvgTemperatureListDto {
  constructor({ min, max, average, data, variance, coefficientOfVariation }) {
    this.min = Number(min);
    this.max = Number(max);
    this.average = Number(average);
    this.variance = Number(variance);
    this.coefficientOfVariation = Number(coefficientOfVariation);
    console.log(data);
    this.data = data.map((record) => new AvgTemperatureRecordDto(record));
  }
}
