import pandas as pd
import matplotlib.pyplot as plt
from pathlib import Path

# This finds the folder this script lives in, no matter where you run it from
SCRIPT_FOLDER = Path(__file__).parent

CSV_FILE = SCRIPT_FOLDER / "sample_sales_data.csv"
DATE_COLUMN = "date"
TARGET_COLUMN = "target"
ACTUAL_COLUMN = "actual"


def load_data(csv_file):
    df = pd.read_csv(csv_file, parse_dates=[DATE_COLUMN])
    df = df.sort_values(DATE_COLUMN)
    return df


def add_calculations(df):
    df["variance"] = df[ACTUAL_COLUMN] - df[TARGET_COLUMN]
    df["variance_pct"] = (df["variance"] / df[TARGET_COLUMN]) * 100
    df["actual_7day_avg"] = df[ACTUAL_COLUMN].rolling(window=7, min_periods=1).mean()
    df["target_7day_avg"] = df[TARGET_COLUMN].rolling(window=7, min_periods=1).mean()
    return df


def print_summary(df):
    total_target = df[TARGET_COLUMN].sum()
    total_actual = df[ACTUAL_COLUMN].sum()
    total_variance = total_actual - total_target
    pct_of_target = (total_actual / total_target) * 100
    days_missed = (df["variance"] < 0).sum()
    days_hit = (df["variance"] >= 0).sum()
    print("=" * 50)
    print("SALES TREND SUMMARY")
    print("=" * 50)
    print(f"Period: {df[DATE_COLUMN].min().date()} to {df[DATE_COLUMN].max().date()}")
    print(f"Total target:  ${total_target:,.0f}")
    print(f"Total actual:  ${total_actual:,.0f}")
    print(f"Variance:      ${total_variance:,.0f} ({pct_of_target:.1f}% of target)")
    print(f"Days hit target:   {days_hit}")
    print(f"Days missed target: {days_missed}")
    if len(df) >= 14:
        last_7 = df.tail(7)[ACTUAL_COLUMN].sum()
        prev_7 = df.tail(14).head(7)[ACTUAL_COLUMN].sum()
        change = last_7 - prev_7
        direction = "up" if change > 0 else "down"
        print(f"Trend: {direction} ${abs(change):,.0f} week-over-week")
    print("=" * 50)


def plot_trend(df):
    plt.figure(figsize=(11, 6))
    plt.plot(df[DATE_COLUMN], df[ACTUAL_COLUMN], color="#999999", alpha=0.4, label="Actual (daily)")
    plt.plot(df[DATE_COLUMN], df[TARGET_COLUMN], color="#1D9E75", linestyle="--", label="Target (daily)")
    plt.plot(df[DATE_COLUMN], df["actual_7day_avg"], color="#D85A30", linewidth=2.5, label="Actual (7-day average)")
    plt.title("Sales vs Target Over Time")
    plt.xlabel("Date")
    plt.ylabel("Sales ($)")
    plt.legend()
    plt.xticks(rotation=45)
    plt.tight_layout()
    plt.savefig(SCRIPT_FOLDER / "sales_trend_chart.png", dpi=150)
    plt.show()


def main():
    df = load_data(CSV_FILE)
    df = add_calculations(df)
    print_summary(df)
    plot_trend(df)


if __name__ == "__main__":
    main()