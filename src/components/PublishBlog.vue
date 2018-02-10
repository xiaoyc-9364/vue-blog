<template>
	<main class="container">
		<div class="form-group">
			<label class="col-form-label" for="blog_title">标题:</label>
			<input type="text" class="form-control" placeholder="" id="blog_title" v-model="title">
		</div>
		<div class="form-group">
			<label for="blog-inrto">简介:</label>
			<textarea class="form-control" id="blog-intro" rows="3" v-model="intro"></textarea>
		</div>
		<label>内容:</label>
		<div class="blog_content form-control" contenteditable="true" v-html="content"></div>
		<div class="form-group">
			<label class="col-form-label" for="author">作者:</label>
			<input type="text" class="form-control" placeholder="" id="author" v-model="author">
		</div>
		<div class="submit_button container">
			<router-link :to="{name: 'home'}" class="btn btn-primary col-md-2">返回博客列表</router-link>
			<label for="img-file"></label>
			<input type="file" class="form-control-file col-md-3" id="img-file" aria-describedby="fileHelp">
			<button @click="uploadImg" class="btn btn-primary col-md-1 col-md-offset-1">上传图片</button>
			<button @click="publish($event)" name="publish" v-show="!isModify" class="btn btn-primary col-md-1 col-md-offset-1">发布</button>
			<button @click="publish($event)" name="modify" v-show="isModify" class="btn btn-primary col-md-1 col-md-offset-1">保存</button>
			<button @click="reset" class="btn btn-primary col-md-1 col-md-offset-1">清空</button>
		</div>
		<AlertWin :props="alert, isDanger, warnText" @closedTip="closeTip"/>
	</main>
</template>

<script>
import AlertWin from './AlertWin.vue'
export default {
	name: 'PulishBlog',
	data () {
		return {
			title: '',
			intro: '',
			content: '',
			author: '',
			warnText:'',
			isModify: false,		//是否是修改状态
			alert: false,			//是否显示弹出框
			isDanger: true,			//切换弹出框class
			TIMEOUT: 1500			//弹出框消失时间
		}
	},
	components:{AlertWin},
  	methods: {
		uploadImg() {		//上传图片
			if (!$('input[type="file"]')[0].files[0]) {		
				this.warnWin('请选择要上传的图片!', false);
				return;
			}
			if(!/\.(png|jpe?g|gif)(\?.*)?$/.test($('input[type="file"]')[0].files[0].name)) {
				this.warnWin('请上传png,jpeg,jpg或者gif格式的图片!', false);
				$('input[type="file"]').val('');
				return;
			}
			var formData = new FormData();
			formData.append("file",$('input[type="file"]')[0].files[0]);
			
			this.$http.post('api/upload-img', formData).then(res => {
				document.execCommand('insertimage', false, res.bodyText);  //光标位置插入图片
				$('input[type="file"]').val('');
				this.$router.push({name: 'modify', query:{id: this.$route.query.id}});
			}).catch(e => {
				this.warnWin('图片上传错误!', false);
				console.error(e);
			});
		},
		publish(e) {		//上传文章
			const name = e.target.getAttribute('name');
			let attentionText, url;

			if (name === 'publish') {
				attentionText = '发布成功!'
				url = '/api/publish';
			} else {
				attentionText = '修改成功!'
				url = '/api/modify-article';
			}
			this.content = document.querySelector('.blog_content').innerHTML;
			if (this.title === '') {
				this.warnWin('博客标题不能为空!', false);
				return;
            }
            if (this.intro === '') {
				this.warnWin('博客简介不能为空!', false);
				return;
            }
            if (this.content === '') {
				this.warnWin('博客内容不能为空!', false);
				return;
            }
            if (this.author === '') {
				this.warnWin('博客作者不能为空!', false);
				return;
            }
			this.$http.post(url, {
				id: this.$route.query.id,
				title: this.title,
				intro: this.intro,
				content: this.content,
				author: this.author
			}).then((res) => {
				this.warnWin(attentionText, true);
				setTimeout(() => {
					this.$router.push({name: 'article', query:{id: res.body._id, isModify: this.isModify}});  //重定向到阅读文章组件
				}, this.TIMEOUT);
			}).catch(e => {
				this.$router.push({name: '404'});
				console.error(e);
			});
		},
		reset() {		//清空
			this.title = '';
			this.intro = '';
			this.content = '';
			this.author = '';
		},
		closeTip() {
			this.alert = false;
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
	created() {
		if(this.$route.query.id) {
			this.$http.get('/api/get-article', {
				params: {
					id: this.$route.query.id,
					isModify: true
				}
			}).then(res => {
				const body = res.body;
				this.title = body.title;
				this.intro = body.intro;
				this.content = body.content;
				this.author = body.author;
				this.isModify = true;
			}).catch(e => {
				this.$router.push({name: '404'});
				console.error(e);
			});
		}
	}
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" rel="stylesheet/scss" scoped>
	textarea {
		resize: none;
	}
	.blog_content {
		white-space: pre-wrap;
		background: #fff;
		min-height: 500px;
		/deep/ img {
			vertical-align: bottom;
			max-width: 100%;
			max-height: 100%;
		}
	}
	.form-control-file {
		display: inline-block;
	}
	.btn{
		margin-right: 20px;
	}
</style>
