<template>
    <article class="container">
        <h1 class="text-center" >{{article.title}}</h1>
        <div class="text-center">
            <span class="author">作者:
                <router-link :to="{name: 'author', query: {author: article.author, page:1}}">
                    <img v-bind:src="article.headIcon" class="portrait"/>&nbsp;{{article.author}}
                </router-link>
            </span>
            <span class="publish_time">发表时间: {{article.date}}</span>
        </div>
        <a href="javascript:;" @click="goback" class="btn btn-primary">返回</a>
        <router-link :to="{ name: 'publish'}" class="btn btn-primary">写博客</router-link>
        <router-link :to="{ name: 'modify', query: { id: article._id }}" class="btn btn-primary">修改</router-link>
        <router-link :to="{ name: 'home'}" class="btn btn-primary">返回博客列表</router-link>
        <div class="content" v-html="article.content"></div>
        <div class="clearfix">
            <textarea class="form-control" id="blog-inrto" rows="3" v-model="appraiseText"></textarea>
            <button class="btn btn-primary float-right" id="appraise" @click="addAppraise">评价</button>
            <a href="javascript:;" class="click_like commont float-right" id="click_like" @click="addLike">
                <img src="../assets/images/star_click.png" alt="">
                <span class="like_num">{{article.like}}</span>
            </a> 
        </div>
        <ul class="appraise_list">
            <li v-for="(value, index) in article.appraises" :key="index">
                <p class="appraise_text">{{value.text}}</p>
                <p class="appraise_date">{{value.date}}</p>
            </li>
        </ul>
        <Gotop/>
    </article>
</template>

<script>
import Gotop from './Gotop'
export default {
    name: 'Article',
    data () {
        return {
        article: {},
        appraiseText: ''
        }
    },
    components: {Gotop},
    created() {
        this.$http.get('/api/get-article', {
            params: {
                id: this.$route.query.id,
                isModify: this.$route.query.isModify
            }
        }).then(res => {
            this.article = res.body;
        }).catch(e => {
            this.$router.push({name: '404'});
            console.error(e);
        });
    },
    methods: {
        addAppraise() {     //添加评论
            this.$http.post('/api/add-appraise', {
                id: this.article._id,
                text: this.appraiseText
            }).then(res => {
                this.article.appraises = res.body.appraises;
                this.appraiseText = "";
            }).catch(e => {
                this.$router.push({name: '404'});
                console.error(e)
            });
        },
        addLike() {         //点赞
            this.$http.get('/api/add-like', {
                params: {
                    id: this.$route.query.id
                }
            }).then(res => {
                this.article.like = res.body.like;
            }).catch(e => {
                this.$router.push({name: '404'});
                console.error(e)
            });
        },
        goback() {
            this.$router.go(-1);
        }
    },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
    .content {
        white-space: pre-wrap;
        min-height: 30em;
        padding: 15px;
        word-wrap: break-word;

        /deep/ img {
            vertical-align: bottom;
            max-width: 100%;
            max-height: 100%;
            display: inline-block;
        }
    }
    textarea {
        resize: none;
    }
    .appraise_list {
        list-style: none;
        margin: 0;
        padding: 0;
        li {
            border-bottom: 1px solid #000;
            padding: 10px 15px;
            box-sizing: border-box;
            margin: 10px 0;
            .appraise_text {
                white-space: pre-wrap;
                height: 65px;
                overflow: hidden;
                text-overflow: ellipsis;
                font-size: 16px;
            }
        }
        li + li {
            margin-top: 10px;
        }
    }
    .portrait {
        display: inline-block;
        width: 20px;
        height: 20px;
        border: none;
    }
    textarea.form-control {
        margin-bottom: 10px;
    }
    button.float-right {
        margin-left: 20px;
    }
</style>
