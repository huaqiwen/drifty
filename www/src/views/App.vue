<template>
    <div>
        <p>{{ text }}</p>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
    data() {
        return {
            text: 'Test',
        };
    },
});
</script>

<style>
</style>    