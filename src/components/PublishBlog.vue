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
			<button @click="publish($event)" name="publish" v-show="!isEdit" class="btn btn-primary col-md-1 col-md-offset-1">发布</button>
			<button @click="publish($event)" name="modify" v-show="isEdit" class="btn btn-primary col-md-1 col-md-offset-1">修改</button>
			<button @click="reset" class="btn btn-primary col-md-1 col-md-offset-1">清空</button>
		</div>
		<div class="alert" :class="{'alert-danger': isDanger, 'alert-success': !isDanger}" v-show="alert">
			<button type="button" class="close" @click.prevent="closeTip">&times;</button>
			<strong>{{warnText}}</strong>
		</div>
	</main>
</template>

<script>
export default {
	name: 'PulishBlog',
	data () {
		return {
			title: '',
			intro: '',
			content: '',
			author: '',
			warnText:'',
			isEdit: false,
			alert: false,
			isDanger: true,
			TIMEOUT: 1500
		}
	},
  	methods: {
		uploadImg() {
			if (!$('input[type="file"]')[0].files[0]) {
				this.warnWin('请选择要上传的图片!', false);
				return;
			}
			if(!/\.(png|jpe?g|gif)(\?.*)?$/.test($('input[type="file"]')[0].files[0].name)) {
				this.warnWin('请上传png,jpeg,jpg或者gif格式的图片!', false);
				return;
			}
			var formData = new FormData();
        	formData.append("file",$('input[type="file"]')[0].files[0]);
			this.$http.post('api/upload-img', formData).then(res => {
				document.execCommand('insertimage', false, res.bodyText);
			});
		},
		publish(e) {
			const name = e.target.getAttribute('name');
			let attentionText, url;

			if (name === 'publish') {
				attentionText = '发布成功!'
				url = '/api/publish';
			} else {
				attentionText = '修改成功!'
				url = '/api/modify-article';
			}
			const blogContent = document.querySelector('.blog_content').innerHTML;
			if (this.title === '') {
				this.warnWin('博客标题不能为空!', false);
				return;
            }
            if (this.intro === '') {
				this.warnWin('博客简介不能为空!', false);
				return;
            }
            if (blogContent === '') {
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
				content: blogContent,
				author: this.author
			}).then((res) => {
				this.warnWin(attentionText, true);
				setTimeout(() => {
					this.$router.push({name: 'article', query:{id: res.body._id}});
				}, this.TIMEOUT);
			}).catch(e => {
				console.error(e);
			});
		},
		reset() {
			this.title = '';
			this.intro = '';
			this.content = '';
			this.author = '';
		},
		closeTip() {
			this.alert = false;
		},
		warnWin(str, isfaild) {
			this.warnText = str;
			this.alert = true;
			this.isDanger = !isfaild;
			setTimeout(() => {
				this.alert = false;
			}, this.TIMEOUT);
		},
	},
	created() {
		if(this.$route.query.id) {
			this.$http.get('/api/get-article', {
				params: {
					id: this.$route.query.id
				}
			}).then(res => {
				const body = res.body;
				this.title = body.title;
				this.intro = body.intro;
				this.content = body.content;
				this.author = body.author;
				this.isEdit = true;
			}).catch(e => {
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
		height: 500px;
		img {
			display: inline;
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
	div.alert {
		position: fixed;
		left: 50%;
		top: 50%;
		transform: translate(-50%, -200%);
	}
</style>
