declare module 'react-horizontal-datepicker' {
    import { FC } from 'react'
  
    interface DatePickerProps {
      getSelectedDay: (date: Date) => void
      endDate?: number
      selectDate?: Date
      labelFormat?: string
      color?: string
    }
  
    const DatePicker: FC<DatePickerProps>
    export default DatePicker
  }
  