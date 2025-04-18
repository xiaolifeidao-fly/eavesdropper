package com.kakrolot.reader;

import java.util.List;

/**
 * Created by xianglong on 2017/11/24.
 */
public abstract class FileReader<T> {

    public abstract List<T> read(int readerNum);

    public abstract void releaseResource();

}
