export class AvgHumidityRecordDto {
  constructor({ date, humidityAvg }) {
    this.date = date;
    this.humidityAvg = Number(humidityAvg);
  }
}
