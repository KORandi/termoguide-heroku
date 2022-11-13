export class AvgTemperatureRecordDto {
  constructor({ date, val }) {
    this.date = date;
    this.value = Number(val);
  }
}
