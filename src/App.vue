<template>
  <div id="app">
    <!-- <img src="./assets/logo.png"> -->
    <Articles/>
    <publish-blog></publish-blog>
    <blog-list></blog-list>
  </div>
</template>

<script>
import Articles from './components/Articles'
import PublishBlog from './components/PublishBlog'
import BlogList from './components/BlogList'
import Router from 'vue-router'
Vue.use(Router)


export default {
  name: 'App',
  components: {
    Articles, 
    PublishBlog,
    BlogList
  }
}
</script>

<style>

</style>
