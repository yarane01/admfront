namespace biInfo {
    declare var moment: any;
    declare var d3: any;

    export function getChartAnimation() {
        return {
            duration: 500,
            easing: 'out',
            startup: true
        }
    }

    export interface Response {
        status: string,
        data?: any
    }

    export function getSingleResponse(response, nested?): Response {
        if (response.data.status == "OK") {
            return {
                status: "OK",
                data: nested ? response.data.payload[0][0] : response.data.payload[0]
            }
        }
        else return {
            status: "Fail",
            data: nested ? response.data.payload[0][0] : response.data.payload[0]
        }
    }

    export function getDoubleResponse(response): Response {
        if ((response[0].data.status == "OK") && (response[1].data.status == "OK"))
            return {
                status: "OK"
            }
        else
            return {
                status: "Fail",
                data: response[0].data.status == "OK" ? response[1].data.payload[0] : response[0].data.payload[0]
            }
    }

    export function dayAndMonth(date) {
        return moment(date, "YYYY-MM-DD").format("MM/DD");
    }

    export function Hour(date) {
        return moment(date, "YYYY-MM-DD HH:mm:ss").format("HH");
    }

    export function toM(value, digits?) {
        if (!digits) digits = 2;
        return (value / 1000000).toFixed(digits).toLocaleString() + "M";
    }

    export class ColorRange {
        private scales;
        private bucket = 0;

        constructor(private count) {
            this.scales = [
                d3.scaleLinear()
                    .domain([0, count])
                    // .interpolate(d3.interpolateHcl)
                    // .range(["#9AF768", "#F27A4D"]),
                    .range(['orangered', 'royalblue']),

                d3.scaleLinear()
                    .domain([0, count])
                    // .interpolate(d3.interpolateHcl)
                    // .range(["#112231", "#3C769D"])
                    .range(["#112231", "#ffd24d"])
            ];

        }

        getColor = (count) => {
            if (count > this.count) count = count % this.count;
            this.bucket = this.bucket == 0 ? 1 : 0;
            return this.scales[this.bucket](count);
        }
    }

}
