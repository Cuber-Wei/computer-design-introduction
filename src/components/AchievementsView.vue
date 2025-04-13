<script setup lang="ts">
import { Card, Row, Col, Tabs } from 'ant-design-vue';

const experiments = {
    weakScaling: [
        '/images/低基数下弱可扩展性实验结果曲线.png',
        '/images/高基数下弱可扩展性实验结果曲线.png'
    ],
    strongScaling: [
        '/images/W-低基数聚合模式的强可扩展性实验结果曲线.png',
        '/images/W-高基数聚合模式的强可扩展性实验结果曲线.png',
        '/images/W2-低基数聚合模式的强可扩展性实验结果曲线.png',
        '/images/W2-高基数聚合模式的强可扩展性实验结果曲线.png'
    ]
};
</script>

<template>
    <div class="container">
        <h2 class="title">项目成果展示</h2>
        <div class="text">
            <p>本项目旨在解决子图匹配并行分组聚合框架在大规模数据集处理中的性能问题，使其支持亿级数据集并提升性能。通过开发任务并行的子图匹配框架，创新性地使用流式推送、并行在线聚合和双模式聚合计算引擎来实现目标。</p>
            <p>本项目实现了并行聚合计算引擎，完成了基础架构的设计，能够支持高基数和低基数场景下的聚合计算，并通过实验验证了该架构的可扩展性。在低基数和高基数的场景下，我们进行了弱可扩展性实验，评估了并行度对每秒聚合计算次数的影响。所实现的并行计算框架在高基数和低基数场景下均表现出良好的弱可扩展性。
            </p>
            <p>本项目还进行了强可扩展性实验，通过调整并行度测试系统在大规模数据集下的加速比。结果表明，系统在某些场景下有较好的强可扩展性，但在高并行度下仍然存在性能瓶颈。</p>
        </div>
        <Tabs default-active-key="1">
            <Tabs.TabPane key="1" tab="弱可扩展性实验">
                <Row :gutter="[16, 16]">
                    <Col :xs="24" :sm="24" :md="12" :lg="12" v-for="(img, index) in experiments.weakScaling"
                        :key="index">
                    <Card>
                        <img :src="img" class="experiment-image" alt="弱可扩展性实验" />
                    </Card>
                    </Col>
                </Row>
            </Tabs.TabPane>

            <Tabs.TabPane key="2" tab="强可扩展性实验">
                <Row :gutter="[16, 16]">
                    <Col :xs="24" :sm="24" :md="12" :lg="12" v-for="(img, index) in experiments.strongScaling"
                        :key="index">
                    <Card>
                        <img :src="img" class="experiment-image" alt="强可扩展性实验" />
                    </Card>
                    </Col>
                </Row>
            </Tabs.TabPane>
        </Tabs>
    </div>
</template>

<style scoped>
.container {
    padding: 2rem;
    width: clamp(75%, 80%, 1200px);
    margin: 0 auto;
}

.text {
    font-size: 1rem;
    line-height: 1.2;
    text-align: left;
    text-indent: 2rem;
}

.title {
    text-align: center;
    margin-bottom: 2rem;
    color: #1a3353;
}

.experiment-image {
    width: 100%;
    object-fit: cover;
    border-radius: 8px;
}

@media (max-width: 768px) {
    .ant-col {
        min-width: 100%;
        padding: 0 12px;
    }
}

@media (max-width: 1199px) {
    .ant-col {
        min-width: 100%;
        padding: 0 12px;
    }
}
</style>