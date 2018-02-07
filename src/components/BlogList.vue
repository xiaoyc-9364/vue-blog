<template>
    <main class="container">
        <h1 class="text-center">博客文章汇总</h1>
        <router-link :to="{ name: 'publish'}" class="btn btn-primary">写博客</router-link>
        <!-- <router-link  href="/" class="btn btn-primary" id="back_index">返回博客汇总表</router-link> -->
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
          <button class="btn btn-primary col-md-1" @click.prevent="search">搜索</button>
          <!-- <router-link class="btn btn-primary col-md-1" :to="{name: 'search', query:{type:searchType, keyword: keyword}}" @click="search">搜索</router-link> -->
        </form>
          
        <ul class="list-group" id="all_blog_article">
          <li v-for="(value, index) in blogList" :key="index">
              <h2><router-link :to="{ name: 'article', query: { id: value._id }}">{{value.title}}</router-link></h2>
              <p class="intro">简介:&nbsp;&nbsp;&nbsp;&nbsp;{{value.intro}}</p>
              <div class="detail">
                  <span class="author">
                      作者:&nbsp;
                      <a href="javascript:;">
                          <img v-bind:src="value.headIcon" class="portrait"/>&nbsp;{{value.author}}
                      </a>
                  </span>
                  <span class="publish_time">发表时间: {{value.date}}</span>
                  <router-link :to="{ name: 'modify', query: { id: value._id }}">修改</router-link>
                  <a href="javascript:;" @click.prevent="delArticle(value._id)">删除</a>
                  <span class="appraise"><router-link :to="{ name: 'article', query: { id: value._id }}">评论({{value.appraises.length}})</router-link></span>
                  <span class="read_num"><router-link :to="{ name: 'article', query: { id: value._id }}">阅读({{value.readNum}})</router-link></span>
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
          <a :href="prevpage" @click.prevent="goPage(-1)" :class="{disabled: page == 1}" class="btn btn-primary float-left">上一页</a>
          <a :href="nextpage" @click.prevent="goPage(1)" :class="{disabled: page == pages}" class="btn btn-primary float-right">下一页</a>
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
        this.goPage();
    },
    methods: {
        getQueryString(name) {
            var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
            var r = window.location.search.substr(1).match(reg);
            if (r != null) {
                return Number(decodeURI(r[2]));
            }
            return null;
        },
        delArticle(id) {
            this.$http.get('/api/del-article',{
                params: {id:id}
            }).then(res => {
                this.warnText = res.body;
                this.alert = true;
                this.goPage();
                setTimeout(() => {
                    this.alert = false;
                }, 1500);
            })
        },
        goPage(n) {
            this.$http.get('/api/get-blog-list', {
                params: {
                    page: (this.getQueryString('page') || 1) + (n || 0)
                }
            }).then(res => {
                const body = res.body;
                this.blogList = body.list;
                this.page = body.page;
                this.pages = body.pages;
                this.limit = body.limit;
                this.count = body.count;
                history.pushState({}, '', window.location.pathname + '?page=' + this.page);
                this.prevpage = window.location.pathname + '?page='+ (this.page - 1);
                this.nextpage = window.location.pathname + '?page='+ (this.page + 1);
            }).catch(e => {
                console.log(e);
            });
        },
        search() {
            if (this.keyword == '') {
                this.$router.push({name: 'blog-list'});
                return;
            }
            this.$http.post('/api/search', {
                type: this.searchType,
                keyword: this.keyword
            }).then(res => {
                const body = res.body;
                this.blogList = body.list;
                this.page = body.page;
                this.pages = body.pages;
                this.limit = body.limit;
                this.count = body.count;
                history.pushState({}, '', window.location.pathname + '?page=' + this.page);
                this.prevpage = window.location.pathname + '?page='+ (this.page - 1);
                this.nextpage = window.location.pathname + '?page='+ (this.page + 1);
            })
        },
        closeTip() {
            this.alert = false;
        }
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

