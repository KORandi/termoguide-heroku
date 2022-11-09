export class AvgTemperatureRecordDto {
  constructor({ date, temperatureAvg }) {
    this.date = date;
    this.temperatureAvg = Number(temperatureAvg);
  }
}
