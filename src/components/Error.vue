<template>
    <div class="container">
        <img src="../assets/images/error.png" alt="404">
        <router-link :to="{name: 'blog-list'}" class="btn btn-primary col-md-3">返  回  首  页</router-link>
    </div>
</template>

<script>
export default {
    name: 'error',
    data () {
        return {
        }
    }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>  
    .container {
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
    }
</style>
