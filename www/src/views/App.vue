<template>
    <div>
        <p>{{ text }}</p>
        <car-grid/>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import CarGrid from '../components/CarGrid.vue';

export default Vue.extend({
    data() {
        return {
            text: 'Test',
        };
    },
    components: {
        CarGrid,
    },
});
</script>

<style>
</style>
