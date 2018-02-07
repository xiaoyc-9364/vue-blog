<template>
    <article class="container">
        <h1 class="text-center" >{{article.title}}</h1>
        <div class="text-center">
            <span class="author">作者:
                <a :href='"/author/?author=" + article.author'>
                    <img :src="article.headIcon" class="portrait"/>&nbsp;{{article.author}}
                </a>
            </span>
            <span class="publish_time">发表时间: {{article.date}}</span>
        </div>
        <router-link :to="{ name: 'home'}" class="btn btn-primary">返回博客列表</router-link>
        <router-link :to="{ name: 'publish'}" class="btn btn-primary">写博客</router-link>
        <router-link :to="{ name: 'modify', query: { id: article._id }}" class="btn btn-primary">修改</router-link>
        <div class="content" v-html="article.content"></div>
        <div class="clearfix">
            <textarea class="form-control" id="blog-inrto" rows="3" v-model="appraiseText"></textarea>
            <button class="btn btn-primary pull-right" id="appraise" @click="addAppraise">评价</button>
            <a href="javascript:;" class="click_like commont" id="click_like" @click="addLike">
                <img src="../assets/images/star_click.png" alt="">
                <span class="like_num">{{article.like}}</span>
            </a> 
        </div>
        <ul class="appraise_list">
            <li v-for="(value, index) in article.appraises" :key="index">
                <p>{{value.text}}</p>
                <p>{{value.date}}</p>
            </li>
        </ul>
    </article>
</template>

<script>
export default {
    name: 'Article',
    data () {
        return {
        article: {},
        appraiseText: ''
        }
    },
    created() {
        this.$http.get('/api/get-article', {
            params: {
                id: this.$route.query.id
            }
        }).then(res => {
            this.article = res.body;
        }).catch(e => {
            console.log(e);
        });
    },
    methods: {
        addAppraise() {
            this.$http.post('/api/add-appraise', {
                id: this.article._id,
                text: this.appraiseText
            }).then(res => {
                this.article.appraises = res.body.appraises;
                this.appraiseText = "";
            }).catch(e => {
                console.log(e)
            });
        },
        addLike() {
            this.$http.get('/api/add-like', {
                params: {
                    id: this.$route.params.id
                }
            }).then(res => {
                this.article.like = res.body.like;
            }).catch(e => {
                console.log(e)
            });
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
  }
  textarea {
    resize: none;
  }
  .pull-right {
    float: right;
  }
  .appraise_list {
        li {
            height: 100px;
            border-bottom: 1px solid #000;
            padding: 10px 15px;
            box-sizing: border-box;

            .appraise_content {
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
</style>
