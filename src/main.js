// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import VueResource from 'vue-resource'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.min'
import $ from 'jquery'
import Router from 'vue-router'
import Article from './components/Article.vue'
import BlogList from './components/BlogList.vue'
import PulishBlog from './components/PublishBlog.vue'

Vue.use(VueResource);
Vue.use(Router);

const router = new Router({
  mode: 'history',
  routes: [
    {
      path: '/blog',
      name: 'article',
      component: Article
    },
    {
      path: '/',
      name: 'home',
      redirect:'/blog-list',
    },
    {
      path: '/publish',
      name: 'publish',
      component: PulishBlog
    },
    {
      path: '/modify',
      name: 'modify',
      component: PulishBlog
    },
    {
      path: '/blog-list',
      name: 'blog-list',
      component: BlogList
    },
    {
      path: '/search',
      name: 'search',
      component: BlogList
    }
  ]
});

Vue.http.options.emulateJSON = true;

  
Vue.config.productionTip = true;

/* eslint-disable no-new */
new Vue({
  el: '#blog',
  router,
  data: {
    currentRoute: window.location.pathname
  }

})
