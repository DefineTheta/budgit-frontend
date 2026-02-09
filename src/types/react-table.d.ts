import "@tanstack/react-table";

declare module "@tanstack/react-table" {
	interface ColumnMeta<TData extends RowData, TValue> {
		fluid?: boolean;
	}
	interface TableMeta<TDate extends RowData> {
		onEdit?: (row: TData) => void;
	}
}
