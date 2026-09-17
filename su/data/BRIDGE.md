# 桥接 id 清单（两边都必须实现这些 id，其余自由发挥）
## math 侧必备 id
ns.max_digits ns.make24 ns.estimate ns.percent ns.abacus ns.factor ns.log_scale ns.magnitude
al.function_zoo al.exp_log al.quadratic al.inequality_amgm al.substitution al.polynomial al.system_eq al.sequence
ge.vector ge.dot_projection ge.unit_circle al.trig ge.conic ge.transform ge.distance ge.area_cross ge.similar
la.matrix_transform la.eigen la.svd la.rank la.inverse la.basis la.projection la.determinant
ca.derivative_slope ca.integral_area ca.chain_rule ca.taylor ca.gradient ca.optimization ca.ode ca.limit
pr.distribution pr.bayes pr.clt pr.expectation pr.variance pr.covariance pr.mle pr.entropy
co.perm_comb co.pigeonhole co.binomial co.recursion co.inclusion_exclusion co.generating co.graph_count co.stars_bars
di.modular di.prime di.gcd di.graph di.logic di.induction di.bits di.big_o
## code 侧必备 id
py.list_dict py.loop_comprehension py.function py.recursion py.class py.bigo py.string py.debug
np.array_shape np.broadcast np.dot np.reshape np.axis np.overflow np.random np.vectorize
vz.scatter vz.line vz.heatmap vz.contour vz.hist vz.3d vz.color vz.subplot
da.dataframe da.groupby da.merge da.clean da.normalize da.split da.pipeline da.leak
ml.gradient_descent ml.linear_reg ml.logistic ml.svm ml.tree ml.forest ml.knn ml.kmeans ml.pca ml.naive_bayes ml.xgboost ml.metrics
dl.mlp dl.activation dl.backprop dl.cnn dl.rnn dl.attention dl.transformer dl.resnet dl.vae dl.gan dl.unet dl.loss
bm.sequence bm.protein_embed bm.image_seg bm.flow_gating bm.dose_response bm.survival bm.pk_ode bm.cell_cluster
## 建议桥
ge.dot_projection↔np.dot  la.matrix_transform↔np.reshape/dl.mlp  la.eigen↔ml.pca  la.svd↔ml.pca
ca.derivative_slope↔ml.gradient_descent  ca.chain_rule↔dl.backprop  ca.gradient↔ml.gradient_descent
pr.bayes↔ml.naive_bayes  pr.mle↔ml.logistic/dl.loss  pr.entropy↔dl.loss/ml.tree  pr.clt↔np.random
al.exp_log↔dl.activation/ml.logistic  ns.log_scale↔np.overflow  ns.magnitude↔py.bigo  co.perm_comb↔py.recursion
ca.ode↔bm.pk_ode  pr.distribution↔vz.hist  la.projection↔ml.linear_reg  di.graph↔dl.attention  ge.transform↔vz.3d
