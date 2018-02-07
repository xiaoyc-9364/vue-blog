<template>
    <main class="container">
        <h1 class="text-center">博客文章汇总</h1>
        <router-link :to="{ name: 'publish'}" class="btn btn-primary">写博客</router-link>
        <router-link  :to="{name: 'home'}" class="btn btn-primary">返回博客汇总表</router-link>
        <form class="form-inline container">
          <label for="search" class="">搜索类型:</label>
          <select name="search_type" id="search_type" class="form-control col-md-2" v-model="searchType">
                  <option value="all">全部</option>
                  <option value="title">标题</option>
                  <option value="intro">简介</option>
                  <option value="content">内容</option>
                  <option value="author">作者</option>
          </select>
          <label for="keyword" class="">关键字:</label>
          <input type="text" class="form-control col-md-3" id="keyword" placeholder="请输入搜索内容" v-model="keyword">
          <router-link class="btn btn-primary col-md-1" :to="{name: 'search', query:{type:searchType, keyword: keyword, page: 1}}">搜索</router-link>
        </form>
          
        <ul class="list-group" id="all_blog_article">
          <li v-for="(value, index) in blogList" :key="index">
              <h2><router-link :to="{ name: 'article', query: { id: value._id }}">{{value.title}}</router-link></h2>
              <p class="intro">简介:&nbsp;&nbsp;&nbsp;&nbsp;{{value.intro}}</p>
              <div class="detail">
                  <span class="author">
                      作者:&nbsp;
                      <router-link :to="{name: 'author', query: {author: value.author, page:1}}">
                          <img v-bind:src="value.headIcon" class="portrait"/>&nbsp;{{value.author}}
                      </router-link>
                  </span>
                  <span class="publish_time">发表时间: {{value.date}}</span>
                  <router-link :to="{ name: 'modify', query: { id: value._id }}">修改</router-link>
                  <a href="javascript:;" @click.prevent="delArticle(value._id)">删除</a>
                  <span class="appraise"><router-link :to="{ name: 'article', query: { id: value._id }}">评论({{value.appraises.length}})</router-link></span>
                  <span class="read_num"><router-link :to="{ name: 'article', query: { id: value._id }}">阅读({{value.readNum - 1}})</router-link></span>
                  <span class="like_num">
                          <img src="../assets/images/star_click.png"/>
                          {{value.like}}
                  </span>
              </div>
          </li>
        </ul>
        <p class="h5 text-center">一共有&nbsp;{{count}}&nbsp;条博客,
            每页显示&nbsp;{{limit}}&nbsp;条博客,
            一共&nbsp;{{pages}}&nbsp;页,当前第&nbsp;{{page}}&nbsp;页.</p>
        <div class="clearfix">
          <a :href="prevpage" @click.prevent="showPage(-1)" :class="{disabled: page == 1}" class="btn btn-primary float-left">上一页</a>
          <a :href="nextpage" @click.prevent="showPage(1)" :class="{disabled: page == pages}" class="btn btn-primary float-right">下一页</a>
        </div>
        <div class="alert alert-success"  v-show="alert">
			<button type="button" class="close" @click.prevent="closeTip">&times;</button>
			<strong>{{warnText}}</strong>
		</div>
    </main>
</template>

<script>
export default {
    name: 'BlogList',
    data () {
        return {
            blogList: [],
            page: 1,
            pages: 1,
            limit: 0,
            count: 0,
            prevpage: '',
            nextpage: '',
            searchType: 'all',
            keyword:'',
            alert: false,
            warnText: '',
        }
    },
    created() {
        this.showPage();
    },
    methods: {
        searchToObject() {  //将window.location.search转换为对象
            let pairs = window.location.search.substring(1).split("&"),
                obj = {},
                pair,
                i;

            for ( i in pairs ) {
                if ( pairs[i] === "" ) {
                    continue;
                }

                pair = pairs[i].split("=");
                obj[ decodeURIComponent( pair[0] ) ] = decodeURIComponent( pair[1] );
            }

            return obj;
        },
        setSearch(key, value) {     //设置search的值,如果没有该值则添加
            const searchObj = this.searchToObject();
            let str = '', 
                arr = [],
                i;

            searchObj[key] = value;
            for ( i in searchObj) {
                arr.push(i + '=' + decodeURIComponent(searchObj[i]));
            }
            return '?' + arr.join('&');
        },
        delArticle(id) {    //删除文章
            this.$http.get('/api/del-article',{
                params: {id:id}
            }).then(res => {
                this.warnText = res.body;
                this.alert = true;
                this.showPage();     //重新渲染该页
                setTimeout(() => {
                    this.alert = false;
                }, 1500);
            }).catch(e => {
                this.$router.push({name: '404'});
                console.log(e);
            });
        },
        showPage(n) {       //渲染列表,n为切换的页数
            const searchObject = this.searchToObject();  //将search转换为对象
            this.$http.get('/api' + window.location.pathname, {
                params: {                               //传给服务器的查询数据
                    type: searchObject.type,
                    keyword: searchObject.keyword,
                    author: searchObject.author,
                    page: Number(searchObject.page || 1) + (n || 0)
                }
            }).then(res => {
                const body = res.body;
                this.blogList = body.list;
                this.page = body.page;
                this.pages = body.pages;
                this.limit = body.limit;
                this.count = body.count;
                //重置路由
                history.pushState({}, '', window.location.pathname + this.setSearch('page', this.page));  
                //重置上下页路由
                this.prevpage = window.location.pathname + this.setSearch('page', this.page - 1);
                this.nextpage = window.location.pathname + this.setSearch('page', this.page + 1);  
            }).catch(e => {
                this.$router.push({name: '404'});
                console.log(e);
            });
        },
        closeTip() {    //关闭提示框
            this.alert = false;
        }
    },
    watch: {
        '$route': function() {      //路由变化是渲染列表
            if (this.keyword === '' && window.location.pathname ==='/search') {
                this.$router.push({name: 'blog-list', query: {page: 1}});
            }
            this.showPage();
        },
    }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
    form.container {
      margin-top: 10px;
    }
    select {
      margin-right: 20px;
    }
    .portrait {
        display: inline-block;
        width: 20px;
        height: 20px;
        border: none;
    }
    ul {
      list-style: none;

      li {
        margin: 10px 0;
        padding: 10px;
        border: 1px solid #000;

        &::after {
            content: '';
            display: block;
            height: 0;
            visibility: hidden;
            clear: both;
        }
       
        h2 {
            font-size: 20px;
            line-height: 2;

            a {
                color: #000;
            }
        }

        .intro {
            height: 4.5em;
            line-height: 1.5em;
            // white-space: n/; 
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .detail{
            span {
                display: inline-block;

                &.author{
                    width: 200px;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;

                    a {
                        color: rgb(5, 127, 203);
                    }
                }

                &.author,
                &.publish_time {
                    float: left;
                    margin-right: 30px;
                }

                &.appraise,
                &.read_num,
                &.like_num {
                    float: right;
                    margin-left: 30px;
                    a {
                        color: rgb(75, 137, 231);
                    }
                }
                &.like_num {
                    color:rgb(238, 102, 102);
                    cursor: default;
                    img {
                        width: 20px;
                        height: 20px;
                    }
                }
            }
        }
      }
    }
    div.alert {
		position: fixed;
		left: 50%;
		top: 50%;
		transform: translate(-50%, -200%);
	}
</style>

