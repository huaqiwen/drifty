<template>
    <b-container>
        <b-row
            v-for="(_, y) in numRows" :key="y"
            class="row"
        >
            <b-col
                v-for="(_, x) in numColumns" :key="x"
                class="p-0"
                cols="2"
            >
                <div
                    :id="getCarId(x, y)"
                    class="car square"
                    :class="{ 'car-empty': getCar(x, y) === 0 }"
                    :draggable="getCar(x, y) !== 0"
                    @dragstart="dragStart($event, x, y)"
                    @dragend="dragEnd($event, x, y)"
                    @dragover.prevent
                    @drop.prevent="drop($event, x, y)"
                >
                    {{ getCar(x, y) || '' }}
                </div>
            </b-col>
        </b-row>
    </b-container>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
    data() {
        // TODO: use actual data
        return {
            numRows: 4,
            numColumns: 4,
            cars: [
                0, 1, 0, 2,
                2, 3, 1, 0,
                2, 4, 2, 5,
                0, 1, 3, 0,
            ],
        };
    },
    methods: {
        getCarId(x: number, y: number): string {
            return x.toString() + ',' + y.toString();
        },
        getCar(x: number, y: number): number {
            return this.cars[y * this.numColumns + x];
        },
        setCar(x: number, y: number, value: number) {
            this.cars.splice(y * this.numColumns + x, 1, value);
        },
        drop(e: DragEvent, x: number, y: number) {
            const fromXStr = e.dataTransfer.getData('x');
            // Empty string means data not set, so not dropping a car
            if (fromXStr === '') return;

            const fromX = parseInt(fromXStr);
            const fromY = parseInt(e.dataTransfer.getData('y'));

            // Drag to same position
            if (fromX === x && fromY === y) return;

            const car = this.getCar(x, y);
            if (car === 0) {
                // Move car
                this.setCar(x, y, this.getCar(fromX, fromY));
                this.setCar(fromX, fromY, 0);
            } else if (car === this.getCar(fromX, fromY)) {
                // Combine cars and upgrade
                this.setCar(fromX, fromY, 0);
                this.setCar(x, y, car + 1);
            } else {
                // Can't combine cars
            }
        },
        dragStart(e: DragEvent, x: number, y: number) {
            const target = e.target as HTMLElement;
            e.dataTransfer.setData('x', x.toString());
            e.dataTransfer.setData('y', y.toString());

            setTimeout(() => {
                target.style.opacity = '0';
            }, 0);
        },
        dragEnd(e: DragEvent, x: number, y: number) {
            const target = e.target as HTMLElement;
            target.style.opacity = '1';
        },
    },
});
</script>

<style scoped>
.row {
    width: 100%;
    text-align: center;
}

.square {
    background-color: gray;
    margin: 10%;
}

.square:after {
    content: "";
    display: inline-block;
    padding-bottom: 100%;
}

.car {
    cursor: pointer;
    user-select: none;
}

.car-empty {
    min-width: 1;
    min-height: 1;
    cursor: default;
}
</style>
