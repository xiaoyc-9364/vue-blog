const express = require('express')
const router = express.Router()
const Blog = require('./db')
const fs = require('fs');
const fn = () => {}
const formidable = require('formidable');
const LIMIT = 2;

const headIconArr = fs.readdirSync('../static/images/headIcon').slice(1);
const random = (n, m) => Math.floor(Math.random() * (m - n + 1) + n);   //随机数

//获取文章信息
router.get('/api/get-article', (req, res) => {
    const id = req.query.id;
    Blog.findOne({_id: id}).then(doc => {
        doc.readNum++;  //阅读量加1
        doc.save();
        res.json(doc);
    })
});

//点赞
router.get('/api/add-like', (req, res) => {
    const id = req.query.id;
    Blog.findOne({ _id: id }).then(doc => {
        doc.like++;     
        doc.save();
        res.json(doc);
        return doc;
    }).catch(e =>{
        console.log(e);
        res.status(404);
        res.send('404');
    });
});
//添加评论
router.post('/api/add-appraise', (req, res) => {
    const body = req.body,
        id = body.id,
        text = body.text;

    Blog.findOne({_id: id}).then(doc => {
        const appraiseInfo = {
        date: new Date().toLocaleString(),
        text: text
        };
        doc.appraises.unshift(appraiseInfo);     //放到数据库的前端
        return doc.save();
    }).then(doc => {
        res.json(doc);
    }).catch(e => {
        console.log(e);
    });
});
//上传图片
router.post('/api/upload-img', (req, res) => {
    const form = new formidable.IncomingForm();
    form.encoding = 'utf-8';
    form.extensions = true;
    form.parse(req, function(err, fields, files) {
        if (err) {
            // res.json({status: 1, })
        }
        const tmpPath = files.file.path;
        const targetPath = '../static/images/upload/' + files.file.name;
       
        fs.rename(tmpPath, targetPath, function(err) {
            if (err) {
                console.log(err);
            }
            res.send('../static/images/upload/' + files.file.name);
        });
    });
    
});

//发布
router.post('/api/publish', (req, res) => {
    const body = req.body,
        title = body.title,
        intro = body.intro,
        content = body.content,
        author = body.author;
    const i = random(0, headIconArr.length - 1);
    let headIcon = '../static/images/headIcon/' + headIconArr[i];
    Blog.find({author: author}).then(docs => {
        if (docs.length > 0) {
            headIcon = docs[0].headIcon;
        }
        const blog = new Blog({
                title: title,
                intro: intro,
                content: content,
                author: author,
                headIcon: headIcon
            });
        return blog.save();
    }).then(doc => {
        res.json(doc);
    });
});
//修改
router.post('/api/modify-article', (req, res) => {
    const body = req.body;
        id = body.id;
    Blog.findOne({_id: id}).then(doc => {
        console.log(doc);
        doc.title = body.title;
        doc.intro = body.intro;
        doc.content = body.content;
        doc.author = body.author;
        return doc.save();
    }).then(doc => {
        res.json(doc);
    }).catch(e => {
        console.log(e);
    });
});
//删除
router.get('/api/del-article', (req, res) => {
    const id = req.query.id;
    Blog.remove({ _id: id }).sort({ _id: -1 }).then(doc => {
        res.send('删除成功!');
    }).catch(e => {
        throw e;
    });
})
//获取全部数据
router.get('/api/get-blog-list', (req, res) => {
    let query = req.query,
        page = Number(query.page) || 1;
    
    Blog.find().sort({_id: -1}).then((docs) => {
        let count = docs.length,
            pages = Math.ceil(count / LIMIT);          //计算总页数,向上取整
        page = Math.max(1, Math.min(pages, page));
        const data = {
            list: docs.slice(LIMIT * (page - 1), LIMIT * page),
            page: page,
            count: count,
            limit: LIMIT,
            pages: pages,
        };
        res.json(data);
    });
});

//搜索
router.post('/api/search', (req, res) => {
    let docsArr = [],
        body = req.body,
        type = body.type,
        keyword = body.keyword;
        page = Number(body.page) || 1;

    Blog.find().sort({_id: -1}).then(docs => {
        docs.forEach(value => {
            const pattern = new RegExp(keyword, 'gi');      //创建正则
            if (type !== 'all') {
                if (pattern.test(value[type])) {
                    docsArr.push(value);
                }

            } else {
                const typeName = ['title', 'intro', 'content', 'author'];
                typeName.some(type => {
                    const hasKeyword = pattern.test(value[type]);
                    if (hasKeyword) {
                        docsArr.push(value);
                    }
                    return hasKeyword;
                });
            }
        });
        let count = docsArr.length,
            pages = Math.ceil(count / LIMIT);          //计算总页数,向上取整

        page = Math.max(1, Math.min(pages, page));  //当前页的取值范围

        const data = {
            list: docsArr.slice(LIMIT * (page - 1), LIMIT * page),
            page: page,
            count: count,
            limit: LIMIT,
            pages: pages,
            // path: '/blog-list/?page='
        };
        res.json(data);
    }).catch(e => {
        console.log(e);
    }) 

})
module.exports = router;