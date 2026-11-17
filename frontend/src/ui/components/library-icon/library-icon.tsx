const paths = {
    sun: "M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5m-3 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z",
    moon: "M21 14a9 9 0 0 1-11-11 9 9 0 1 0 11 11Z",
    arrow: "M4 12h15m-6-6 6 6-6 6",
    chevron: "m6 9 6 6 6-6",
    shelf: "M3 20h18M5 17V5h4v12m3 0V3h4v14m2-10 3 10",
    filters: "M4 7h16M7 12h10m-7 5h4M9 5v4m6 1v4",
    search: "M15 15l5 5M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z",
    empty: "M3 9l3-5h12l3 5v10H3Zm0 0h5l2 3h4l2-3h5",
    check: "m5 12 4 4L19 6",
    alert: "M12 7v6m0 4h.01M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0Z",
    plus: "M12 5v14M5 12h14",
    close: "m6 6 12 12M18 6 6 18",
    inbox: "M3 5h18v14H3Zm0 9h5l2 2h4l2-2h5",
    bell: "M5 17h14l-2-3V9a5 5 0 0 0-10 0v5Zm5 3a2 2 0 0 0 4 0",
    building: "M3 21h18M6 21V4h12v17M9 8h1m4 0h1m-6 4h1m4 0h1m-4 9v-5h2v5",
    users: "M15 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2m18 0v-2a4 4 0 0 0-3-4M13 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0Zm3-4a4 4 0 0 1 0 8",
    card: "M3 5h18v14H3Zm10 5h5m-5 4h5m-12 2a3 3 0 0 1 6 0m-1-6a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z",
    book: "M12 6v15M3 4h4a5 5 0 0 1 5 4 5 5 0 0 1 5-4h4v15h-4a5 5 0 0 0-5 2 5 5 0 0 0-5-2H3Z",
    feather: "M4 20 15 9M8 16c-2-5 2-11 11-13 0 8-4 13-11 13Zm5-5h5",
    clipboard: "M8 5H5v16h14V5h-3M8 3h8v5H8Zm0 10h8m-8 4h5",
    calendar: "M3 6h18v15H3Zm0 5h18M8 3v5m8-5v5m-8 8h2m4 0h2",
    undo: "M8 4 3 9l5 5M3 9h11a6 6 0 0 1 0 12h-3",
    receipt: "M5 3h14v18l-3-2-4 2-4-2-3 2Zm4 5h6m-6 4h6m-6 4h4",
    truck: "M2 5h13v12H2Zm13 4h4l3 4v4h-7M8 18a2 2 0 1 1-4 0 2 2 0 0 1 4 0Zm12 0a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z",
    refresh: "M20 10a8 8 0 0 0-14-4L3 9m0-5v5h5m-4 5a8 8 0 0 0 14 4l3-3m0 5v-5h-5",
    eye: "M2 12s4-6 10-6 10 6 10 6-4 6-10 6-10-6-10-6Zm13 0a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z",
    eyeOff: "M3 3l18 18M9 6a10 10 0 0 1 3 0c6 0 10 6 10 6a16 16 0 0 1-3 3M6 8a16 16 0 0 0-4 4s4 6 10 6a11 11 0 0 0 4-1",
    sliders: "M4 6h16M4 12h16M4 18h16M9 4v4m6 2v4m-4 2v4",
    chartBar: "M3 20h18M6 16v-5m6 5V7m6 9v-8",
};

export type LibraryIconName = keyof typeof paths;

export function LibraryIcon({ name }: { name: LibraryIconName }) {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
            <path d={paths[name]} />
        </svg>
    );
}
