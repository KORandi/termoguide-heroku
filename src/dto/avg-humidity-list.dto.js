import { AvgHumidityRecordDto } from "./avg-humidity-record.dto";

export class AvgHumidityListDto {
  constructor({ min, max, average, data }) {
    this.min = Number(min);
    this.max = Number(max);
    this.average = Number(average);
    this.data = data.map((record) => new AvgHumidityRecordDto(record));
  }
}
