export class AvgTimeRecordDto {
  constructor({ date, temperatureAvg }) {
    this.date = date;
    this.temperatureAvg = Number(temperatureAvg);
  }
}
