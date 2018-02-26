<template>
    <main class="container">
        <h1 class="text-center">博客文章汇总</h1>
        <router-link :to="{ name: 'publish'}" class="btn btn-primary">写博客</router-link>
        <router-link :to="{name: 'blog-list'}" class="btn btn-primary">返回博客汇总表</router-link>
        <form class="form-inline container">
            <label for="search_type" class="h5">搜索类型:</label>
            <select class="form-control col-md-2" id="search_type" v-model="type">
                <option value="all">全部</option>
                <option value="title">标题</option>
                <option value="intro">简介</option>
                <option value="content">内容</option>
                <option value="author">作者</option>
            </select>
            <label for="keyword" class="h5">关键字:</label>
            <input type="text" class="hidden" style="display: none;"/>
            <input type="text" class="form-control col-md-3" id="keyword" placeholder="请输入搜索内容" v-model="keyword" @keyup.enter="search" />
            <router-link class="btn btn-primary col-md-1" :to="{name: 'search', query:{type:type, keyword: keyword, page: 1}}">搜索</router-link>
        </form>
        <ul class="list-group">
            <li v-for="(value, index) in blogList" :key="index" class="border-primary">
                <h4><router-link :to="{ name: 'article', query: { id: value._id }}">标题:&nbsp;&nbsp;{{value.title}}</router-link></h4>
                <p class="intro h5">简介:&nbsp;&nbsp;{{value.intro}}</p>
                <div class="detail">
                    <span class="author">
                        作者:&nbsp;
                        <router-link :to="{name: 'author', query: {author: value.author, page:page}}">
                            <img v-bind:src="value.headIcon" class="portrait"/>&nbsp;{{value.author}}
                        </router-link>
                    </span>
                    <span class="publish_time">发表时间: {{value.date}}</span>
                    <router-link :to="{ name: 'modify', query: { id: value._id }}">修改</router-link>
                    <a href="javascript:void(0);" @click.prevent="affirmDel(value._id)">删除</a>
                    <span class="appraise"><router-link :to="{ name: 'article', query: { id: value._id }}">评论({{value.appraises.length}})</router-link></span>
                    <span class="read_num"><router-link :to="{ name: 'article', query: { id: value._id }}">阅读({{value.readNum}})</router-link></span>
                    <span class="like_num">
                        <img src="../assets/images/star_click.png"/>
                        {{value.like}}
                    </span>
                </div>
            </li>
        </ul>
        <p class="h5 text-center">
            一共有 {{count}} 条博客,
            每页显示<input type="text" class="small-input" v-model="limit" @keyup.enter="gotoPage">条博客,
            一共 {{pages}} 页,
            当前第<input type="text" class="small-input" v-model="page" @keyup.enter="gotoPage">页.
        </p>
        <div class="clearfix">
            <a :href="prevpage" @click.prevent="showList(-1)" :class="{disabled: page === 1}" class="btn btn-primary float-left">上一页</a>
            <a :href="nextpage" @click.prevent="showList(1)" :class="{disabled: page === pages}" class="btn btn-primary float-right">下一页</a>
        </div>
        <AlertWin :props="alert, isDanger, warnText"/>
        <div class="card border-primary mb-3 fixed-center" style="max-width: 20rem;" v-show="isDel">
            <div class="card-header">确认删除</div>
            <div class="card-body text-primary container">
                <h5 class="card-title text-muted">您确定要删除这条博客吗?</h5>
                <button class="btn btn-primary btn-sm float-right" @click="closeCard">取消</button>
                <button class="btn btn-primary btn-sm float-right affirm" @click.enter="delArticle(blogId)">确定</button>
            </div>
        </div>
    </main>
</template>

<script>
import AlertWin from './AlertWin.vue'

export default {
    name: 'BlogList',
    data () {
        return {
            blogList: [],
            blogId: '',
            // page: 1,
            pages: 1,
            limit: 2,
            count: 0,
            prevpage: '',
            nextpage: '',
            type: 'all',
            keyword:'',
            isDel: false,
            alert: false,
            isDanger: true,		//切换弹出框class
            TIMEOUT: 1000,      //弹窗消失时间
            warnText: '',       //弹窗文本
        }
    },
    components: {AlertWin},
    created() {
        const query = this.$route.query;
        this.page = query.page || 1;
        this.type = query.type || 'all';
        this.keyword = query.keyword || '';
        this.showList();
        $(document).keyup((e) => {
            if (this.isDel && e.keyCode === 27) {
                this.isDel = false;
            }
        });
    },
    methods: {
        setQuery(key, value) {     //设置search的值,如果没有该值则添加
            const searchObj = this.$route.query;
            let str = '', 
                arr = [],
                i;

            searchObj[key] = value;
            for ( i in searchObj) {
                arr.push(i + '=' + decodeURIComponent(searchObj[i]));
            }
            return '?' + arr.join('&');
        },
        affirmDel(id) {
            this.isDel = true;
            this.blogId = id;
        },
        delArticle(id) {    //删除文章
            this.$http.get('/api/del-article',{
                params: {id:id}
            }).then(res => {
                this.showList();     //重新渲染该页
                this.warnWin(res.body, true);
                this.isDel = false;
            }).catch(e => {
                // this.$router.push({name: '404'});
                console.error(e);
            });
        },
        closeCard() {
            this.isDel = false;
        },
        showList(n = 0) {       //渲染列表,n为切换的页数
            if (/\D/.test(this.limit) || /\D/.test(this.page)) {
                this.warnWin('请输入有效数字', false);
                return;
            }
            const query = this.$route.query;
            const pathname = window.location.pathname;
            this.$http.get('/api' + pathname, {
                params: {                               //传给服务器的查询数据
                    type: query.type,
                    keyword: query.keyword,
                    author: query.author,
                    limit: this.limit,
                    page: (this.page || 1) + n
                }
            }).then(res => {
                const body = res.body;
                this.blogList = body.list;
                this.page = body.page;
                this.pages = body.pages;
                this.limit = body.limit;
                this.count = body.count;
                //重置路由
                history.pushState({}, '', pathname + this.setQuery('page', this.page));  
                //重置上下页路由
                this.prevpage = pathname + this.setQuery('page', this.page - 1);
                this.nextpage = pathname + this.setQuery('page', this.page + 1);  
            }).catch(e => {
                // this.$router.push({name: '404'});
                console.error(e);
            });
        },
        search() {
            this.$router.push({name: 'search', query:{type:this.type, keyword: this.keyword, page: 1}});
        },
        gotoPage() {
            this.showList();
        },
        warnWin(str, isfaild) {		//弹出框
			this.warnText = str;
			this.alert = true;
            this.isDanger = !isfaild;
            $('div.alert').fadeIn();
			setTimeout(() => {
                $('div.alert').fadeOut('slow',() => {
                    this.alert = false;
                });
			}, this.TIMEOUT);
		},
    },
    watch: {
        '$route': function() {      //路由变化时渲染列表
            this.page = 1;
            if (this.keyword === '' && window.location.pathname ==='/search') {
                this.$router.push({name: 'blog-list', query: {page: 1}});
            }
            if (window.location.pathname ==='/blog-list') {
                this.type = 'all';
                this.keyword = '';
            }
            this.showList();
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
        border: 2px solid #000;
        border-radius: 20px;

        &::after {
            content: '';
            display: block;
            height: 0;
            visibility: hidden;
            clear: both;
        }
       
        h4 {
            a {
                color: #000;
            }
        }

        .intro {
            height: 4.5em;
            line-height: 1.5em;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .detail{
            font-size: 18px;
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
                    float: right;
                    margin-left: 30px;
                    font-size: 16px;
                    color:rgb(238, 102, 102);
                    cursor: default;
                    img {
                        width: 30px;
                        height: 30px;
                    }
                }
            }
        }
      }
    }
    div.fixed-center {
		position: fixed;
		left: 50%;
		top: 50%;
		transform: translate(-50%, -100%);

        .affirm {
            margin-right: 10px;
        }
	}
    .small-input {
        width: 50px;
        text-align: center;
    }
</style>

