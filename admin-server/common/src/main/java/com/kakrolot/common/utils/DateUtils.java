package com.kakrolot.common.utils;

import java.text.DateFormat;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.util.Calendar;
import java.util.Date;

/**
 * Created by xiaofeidao on 2018/10/3.
 */
public class DateUtils {

    private static ThreadLocal<DateFormat> threadLocalDateFormat = new ThreadLocal<DateFormat>() {
        @Override
        protected DateFormat initialValue() {
            return new SimpleDateFormat("yyyy-MM-dd");
        }
    };

    public enum TimeType {
        DEFAULT("yyyy-MM-dd|HH:mm:ss"),
        yyyyMMddHH("yyyyMMddHH"),
        yyyyMMddHHmmssSSS("yyyyMMddHHmmssSSS"),
        yyyyMMddHHmmss("yyyyMMddHHmmss"),
        yyyyMMdd("yyyyMMdd"),
        yyyy_MM_dd("yyyy-MM-dd"),
        yyyySlashMMSlashdd("yyyy/MM/dd"),
        HHmmss("HHmmss"),
        yyyy_MM_ddHHmmSS("yyyy-MM-dd HH:mm:SS"),
        yyyy_MM_ddHHmmss("yyyy-MM-dd HH:mm:ss");

        String type;

        private TimeType(String type) {
            this.type = type;
        }

        public String getType() {
            return type;
        }
    }

    /**
     * Instance SimpleDateFormat
     *
     * @param timeType
     * @return
     */
    public static SimpleDateFormat getDateFormat(TimeType timeType) {
        if (timeType == null) {
            timeType = TimeType.DEFAULT;
        }
        return new SimpleDateFormat(timeType.getType());
    }

    /**
     * Date format
     *
     * @param timeType
     * @param date
     * @return
     */
    public static String formatDate(TimeType timeType, Date date) {
        if (date == null) {
            return "";
        }
        return getDateFormat(timeType).format(date);
    }

    /**
     * String date transfer to Date
     *
     * @param date
     * @param timeType
     * @return
     */
    public static Date parseDate(String date, TimeType timeType) {
        SimpleDateFormat sdf = getDateFormat(timeType);
        try {
            return sdf.parse(date);
        } catch (ParseException e) {
            e.printStackTrace();
        }
        return null;
    }


    public static Calendar getDayStart(Calendar now) {
        now.set(Calendar.HOUR_OF_DAY, 0);
        now.set(Calendar.MINUTE, 0);
        now.set(Calendar.SECOND, 0);
        now.set(Calendar.MILLISECOND, 0);
        return now;
    }


    public static Date getTodayStart() {
        Calendar now = Calendar.getInstance();
        return DateUtils.getDayStart(now).getTime();
    }

    public static String getTodayStartStr() {
        Date todayStart = getTodayStart();
        return formatDate(TimeType.yyyy_MM_ddHHmmSS,todayStart);
    }

    public static Date addDate(Date date, int day) {
        Calendar cal = Calendar.getInstance();
        cal.setTime(date);
        cal.add(Calendar.DAY_OF_MONTH, day);
        return cal.getTime();
    }

    public static Date addDate(Date date, long min) {
        Calendar cal = Calendar.getInstance();
        cal.setTime(date);
        cal.add(Calendar.MINUTE, (int) min);
        return cal.getTime();
    }

    public static Date addDateBySecond(Date date, long second) {
        Calendar cal = Calendar.getInstance();
        cal.setTime(date);
        cal.add(Calendar.SECOND, (int) second);
        return cal.getTime();
    }

    public static Date getTodayEnd() {
        Calendar now = Calendar.getInstance();
        return DateUtils.getDayEnd(now).getTime();
    }

    public static String getTodayEndStr() {
        Date todayEnd = getTodayEnd();
        return formatDate(TimeType.yyyy_MM_ddHHmmSS,todayEnd);
    }

    public static Date getYesterday() {
        Calendar cal = Calendar.getInstance();
        cal.set(5, cal.get(5) - 1);
        return cal.getTime();
    }

    public static Date getYesterdayStart() {
        Calendar cal = Calendar.getInstance();
        cal.set(5, cal.get(5) - 1);
        return getDayStart(cal).getTime();
    }

    public static String getYesterdayStartStr() {
        Date yesterdayStart = getYesterdayStart();
        return formatDate(TimeType.yyyy_MM_ddHHmmSS,yesterdayStart);
    }

    public static Date getTomorrowStart() {
        Calendar cal = Calendar.getInstance();
        cal.set(5, cal.get(5) + 1);
        return getDayStart(cal).getTime();
    }

    public static String getTomorrowStartStr() {
        Date tomorrowStart = getTomorrowStart();
        return formatDate(TimeType.yyyy_MM_ddHHmmSS,tomorrowStart);
    }

    public static Date getYesterdayMiddle() {
        Calendar now = Calendar.getInstance();
        now.set(Calendar.DAY_OF_MONTH, now.get(Calendar.DAY_OF_MONTH) - 1);
        now.set(Calendar.HOUR_OF_DAY, 12);
        now.set(Calendar.MINUTE, 0);
        now.set(Calendar.SECOND, 0);
        now.set(Calendar.MILLISECOND, 0);
        return now.getTime();
    }

    public static Date getTodaySpecificHour(int hour) {
        Calendar now = Calendar.getInstance();
        now.set(Calendar.HOUR_OF_DAY, hour);
        now.set(Calendar.MINUTE, 0);
        now.set(Calendar.SECOND, 0);
        now.set(Calendar.MILLISECOND, 0);
        return now.getTime();
    }


    public static Calendar getDayEnd(Calendar now) {
        now.add(Calendar.DAY_OF_YEAR, 1);
        now.set(Calendar.HOUR_OF_DAY, 0);
        now.set(Calendar.MINUTE, 0);
        now.set(Calendar.SECOND, 0);
        now.set(Calendar.MILLISECOND, 0);
        now.add(Calendar.MILLISECOND, -1);
        return now;
    }

    public static Long getDifferDays(Date startTime, Date endTime) {
        LocalDate start = startTime.toInstant().atZone(ZoneId.systemDefault()).toLocalDate();
        LocalDate end = endTime.toInstant().atZone(ZoneId.systemDefault()).toLocalDate();
        return ChronoUnit.DAYS.between(start,end);
    }

    public static Date clearHMS(Date date) {
        Date destDate = null;
        try {
            SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
            String s = sdf.format(date);
            destDate = sdf.parse(s);
        } catch (Exception e) {
        }
        return destDate;
    }

}
