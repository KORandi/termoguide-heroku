import { AvgTemperatureRecordDto } from "./avg-temperature-record.dto";

export class AvgTemperatureListDto {
  constructor({ min, max, average, data }) {
    this.min = Number(min);
    this.max = Number(max);
    this.average = Number(average);
    this.data = data.map((record) => new AvgTemperatureRecordDto(record));
  }
}
