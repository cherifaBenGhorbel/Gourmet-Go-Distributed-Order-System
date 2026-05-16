package org.example;

public class OrderHistoryEntryDTO {
    private String event;
    private String detail;
    private long timestamp;

    public OrderHistoryEntryDTO() {
    }

    public OrderHistoryEntryDTO(String event, String detail, long timestamp) {
        this.event = event;
        this.detail = detail;
        this.timestamp = timestamp;
    }

    public String getEvent() {
        return event;
    }

    public void setEvent(String event) {
        this.event = event;
    }

    public String getDetail() {
        return detail;
    }

    public void setDetail(String detail) {
        this.detail = detail;
    }

    public long getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(long timestamp) {
        this.timestamp = timestamp;
    }
}
