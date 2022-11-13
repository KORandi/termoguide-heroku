export class AvgHumidityRecordDto {
  constructor({ date, val }) {
    this.date = date;
    this.value = Number(val);
  }
}
