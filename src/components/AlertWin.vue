<template>
    <div class="alert" :class="{'alert-danger': isDanger, 'alert-success': !isDanger}" v-show="show">
        <!-- <button type="button" class="close" @click="closeTip">&times;</button> -->
        <strong>{{warnText}}</strong>
    </div>
</template>
<script>
    export default {
        name: 'AlertWin',
        data() {
            return {
                show: this.alert
            }
        },
        props: ['isDanger', 'warnText', 'alert'],
    }
</script>
<style lang="scss" scoped>
    div.alert {
        position: fixed;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -200%);
    }
</style>
