package com.faltro.houdoku.util;

import java.time.format.DateTimeFormatter;

public class OutputHelpers {
    public static final DateTimeFormatter dateTimeFormatter =
            DateTimeFormatter.ofPattern("MMM dd, yyyy");

    /**
     * Truncates a string to a maximum length, with a trailing ellipsis.
     *
     * @param string
     * @param length: the maximum length of the output string; must be the
     *                greater of either 3 or the length of the input string
     * @return the given string truncated to the given length
     */
    public static String truncate(String string, int length) {
        return string.length() > length ? string.substring(0, length - 3) + "..." : string;
    }

    /**
     * Represents a double as a String.
     * <p>
     * The resulting string will only contain a decimal if the double cannot
     * be equivalently represented without it.
     *
     * @param dbl
     * @return a String representation of dbl
     */
    public static String doubleToString(Double dbl) {
        String result = dbl.toString();
        if (dbl.intValue() == dbl) {
            result = Integer.toString(dbl.intValue());
        }
        return result;
    }
}