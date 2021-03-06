<template>
  <div class="article-table">
    <el-table :data="articleData">
      <el-table-column type="expand">
        <template slot-scope="props">
          <el-form inline label-position="left" label-width="80px" class="demo-table-expand">
            <el-form-item label="分类">
              <span>{{ props.row.category.name }}</span>
            </el-form-item>
            <el-form-item label="浏览次数">
              <span>{{ props.row.views }}</span>
            </el-form-item>
            <el-form-item label="标签">
              <span class="tag-item" v-for="tag in props.row.tags" :key="tag.id">{{ tag.name }}</span>
            </el-form-item>
            <el-form-item label="赞">
              <span>{{ props.row.like }}</span>
            </el-form-item>
            <el-form-item v-if="props.row.cover" label="封面">
              <img class="cover" :src="props.row.cover" />
            </el-form-item>
            <el-form-item label="描述">
              <span>{{ props.row.description }}</span>
            </el-form-item>
          </el-form>
        </template>
      </el-table-column>
      <el-table-column prop="title" label="标题" min-width="100"></el-table-column>
      <el-table-column prop="created_date" label="发布时间" sortable width="200"></el-table-column>
      <el-table-column prop="authors" label="作者">
        <template slot-scope="scope">
          <span
            class="author-item"
            v-for="author in scope.row.authors"
            :key="author.id"
          >{{ author.name }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="public" label="是否公开" :formatter="row => publicMap[row.public]"></el-table-column>
      <el-table-column prop="status" label="状态" :formatter="row => statusMap[row.status]"></el-table-column>
      <el-table-column prop="star" label="设为精选">
        <template slot-scope="scope">
          <i
            :class="['star el-icon-star-off', scope.row.star === 2 ? 'star-on' : '']"
            @click="setArticleStar(scope.row)"
          ></i>
        </template>
      </el-table-column>
      <el-table-column label="操作" fixed="right" width="270">
        <template slot-scope="scope">
          <el-button type="primary" size="mini" @click="editArticle(scope.row)">编辑</el-button>
          <el-button
            type="primary"
            size="mini"
            @click="setArticlePrivate(scope.row)"
          >{{scope.row.public === 1 ? '私密' : '公开'}}</el-button>
          <el-button
            v-if="scope.row.comment_count"
            type="primary"
            size="mini"
            @click="showComments(scope.row)"
          >评论</el-button>
          <el-button type="danger" size="mini" @click="deleteArticle(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <div class="pagination">
      <el-pagination
        @current-change="handleCurrentChange"
        layout="prev, pager, next, jumper"
        :total="total"
        :background="true"
        :page-size="pageSize"
        :currentPage="currentPage"
      ></el-pagination>
    </div>
    <!-- 评论弹窗 -->
    <el-dialog append-to-body :visible.sync="dialogVisible" :before-close="handleClose">
      <comments v-if="dialogVisible" :id="currentId"></comments>
    </el-dialog>
  </div>
</template>

<script>
import Comments from "./comments";
import article from "@/services/models/article";

const publicMap = {
  1: "公开",
  2: "私密"
};

const statusMap = {
  1: "已发布",
  2: "草稿"
};

export default {
  components: {
    Comments
  },

  props: {
    articleData: {
      type: Array,
      default: () => []
    },

    currentPage: {
      type: Number,
      default: 0
    },

    total: {
      type: Number,
      default: 0
    },
    loading: {
      type: Boolean,
      default: false
    },

    pageSize: {
      type: Number,
      default: 10
    }
  },

  data() {
    return {
      currentId: null,
      publicMap,
      statusMap,
      dialogVisible: false
    };
  },
  watch: {
    loading: function(next) {
      this.$emit("handleLoading", next);
    }
  },
  methods: {
    handleCurrentChange(page) {
      this.$emit("handleCurrentPage", page);
    },

    handleClose() {
      this.dialogVisible = false;
    },

    editArticle(val) {
      this.$emit("handleEdit", val);
    },
    // 设文章为 公开 / 私密
    async setArticlePrivate(val) {
      try {
        this.loading = true;
        const params = {
          publicId: val.public === 1 ? 2 : 1
        };
        const res = await article.updateArticlePublic(val.id, params);
        if (res.errorCode === 0) {
          this.$message.success(`${res.msg}`);
          this.$emit("handleInfoResult", true);
        } else {
          this.loading = false;
          this.$message.error(`${res.msg}`);
        }
      } catch (e) {
        this.loading = false;
        // eslint-disable-next-line no-console
        console.log(e);
      }
    },

    // 设置文章为 精选 / 非精选
    async setArticleStar(val) {
      try {
        this.loading = true;
        const params = {
          starId: val.star === 1 ? 2 : 1
        };
        const res = await article.updateArticleStar(val.id, params);
        if (res.errorCode === 0) {
          this.$message.success(`${res.msg}`);
          this.$emit("handleInfoResult", true);
        } else {
          this.loading = false;
          this.$message.error(`${res.msg}`);
        }
      } catch (e) {
        this.loading = false;
        // eslint-disable-next-line no-console
        console.log(e);
      }
    },

    showComments(val) {
      this.currentId = val.id;
      this.dialogVisible = true;
    },

    deleteArticle(val) {
      this.$confirm("此操作将删除文章, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(async () => {
          try {
            this.loading = true;
            const res = await article.deleteArticle(val.id);
            if (res.errorCode === 0) {
              this.loading = false;
              this.$message.success(`${res.msg}`);
              this.$emit("handleInfoResult", true);
            } else {
              this.loading = false;
              this.$message.error(`${res.msg}`);
            }
          } catch (e) {
            this.loading = false;
            // eslint-disable-next-line no-console
            console.log(e);
          }
        })
        .catch(() => {
          this.$message.info("已取消删除");
        });
    }
  }
};
</script>

<style lang="scss" scoped>
.tag-item,
.author-item {
  margin-right: 4px;

  &:not(:last-child)::after {
    content: ",";
  }
}

.demo-table-expand {
  font-size: 0;

  label {
    width: 90px;
  }

  .el-form-item {
    margin-right: 0;
    margin-bottom: 0;
    width: 50%;
  }
}

.cover {
  max-width: 150px;
  max-height: 150px;
}

.star {
  font-size: 20px;
  cursor: pointer;
}

.star-on {
  color: #4093ff;
}

.pagination {
  display: flex;
  justify-content: flex-end;
  margin: 20px;
}
</style>
