# 参考文献与延伸阅读

本讲义由课程讲义整理而成，相关数学内容建立在已有教材、讲义与研究文献的基础上。感谢相关作者对有限域理论与教学的贡献。以下书目提供对照学习与延伸阅读的入口；列入书目不表示本讲义逐项取材于该书。具体采用的例题、证明、图示或程序，应在相应位置注明来源及适用版本。

## 中文教材

1. 林东岱，《代数学基础与有限域》，第 2 版，高等教育出版社，2022。ISBN：978-7-04-057742-6。[出版社页面](https://xuanshu.hep.com.cn/front/h5Mobile/bookDetails?bookId=61df098c938b7cc2960ee14b)。从代数基础与有限域结构出发，进一步介绍有限域上的多项式、特征与指数和、Galois 环、离散对数、椭圆曲线、伪随机序列及编码与密码应用。适合系统伴读，并为后续应用专题提供入口。
2. 冯荣权编著，《有限域基础》，高等教育出版社，2025。ISBN：978-7-04-064377-0。[出版社页面](https://xuanshu.hep.com.cn/front/h5Mobile/bookDetails?bookId=67ae28663e46f5f63ffe38e0)。包括代数基础、有限域的存在唯一性与元素表示、迹与范数、对偶基与正规基、分圆多项式、不可约与置换多项式、求根与分解算法及指数和。适合对照本讲义的有限域结构、基与多项式部分，并继续学习相关专题。
3. 冯克勤、廖群英，《有限域及其应用》，大连理工大学出版社，2011。ISBN：978-7-5611-5787-9。[出版社书目](https://www.dutp.cn/index/product/prolist.html?category_id=169&page=14)。适合作为中文伴读，联系有限域理论与组合设计、纠错码和密码等应用。另有 2023 年出版版本，ISBN：978-7-5685-4131-2，见[图书馆书目](https://opac.sicau.edu.cn/opac/book/9ac18c2373322d12aaeba0722a6900d9)；引用页码时请注明所用版本。

## 英文教材与参考书

1. Rudolf Lidl and Harald Niederreiter, *Introduction to Finite Fields and their Applications*, 2nd ed., Cambridge University Press, 1994。[出版社页面](https://doi.org/10.1017/CBO9781139172769)。以教学为导向，包含代数基础、有限域结构、多项式及编码、密码等应用，适合作为系统学习的伴读教材。
2. Rudolf Lidl and Harald Niederreiter, *Finite Fields*, 2nd ed., Encyclopedia of Mathematics and its Applications, vol. 20, Cambridge University Press, 1996。[出版社页面](https://doi.org/10.1017/CBO9780511525926)。覆盖有限域结构、多项式及其分解、指数和、方程、置换多项式和线性递归序列，适合查阅较完整的理论与文献。此处年份按出版社页面所列纸质版出版年记录；引用其他印次时以所用书的版权页为准。
3. Gary L. Mullen and Daniel Panario (eds.), *Handbook of Finite Fields*, Chapman and Hall/CRC, 2013。[编者页面与勘误入口](https://people.math.carleton.ca/~daniel/hff/)。适合进阶专题查阅，包含不可约与本原多项式、正规基、算法、组合应用、编码与密码等内容，初读时可按主题选用。

## 按本讲义内容选择阅读

下表是主题对应建议，不表示章节之间逐页对应。

| 本讲义内容 | 建议资料 | 阅读重点 |
|---|---|---|
| 第 1–7 章：群、环与多项式 | 林东岱的代数基础部分；Lidl–Niederreiter 入门教材的 Algebraic Foundations 部分 | 补足群、环、理想与多项式的基础 |
| 第 8–12 章：域扩张与有限域 | 林东岱；冯荣权第 1–2 章；冯克勤–廖群英；Lidl–Niederreiter；Milne | 分裂域、有限域的存在与唯一性、子域、本原元和共轭 |
| 第 13–15 章：自同构、迹与范数、基 | 冯荣权第 3–4 章；Lidl–Niederreiter 的 *Finite Fields*；Milne；*Handbook* 的 Bases 部分 | 核对基域与可分性条件，深入学习对偶基、正规基与分圆多项式 |
| 第 16 章：表示与计算 | 冯荣权第 2、4、7 章；*Handbook* 的 Algorithms 部分；SageMath 文档 | 域模型、不可约多项式、元素表示及计算方法 |
| 第 17–19 章：多项式的组合应用 | Alon 原论文；*Handbook* 的组合应用部分 | 组合零点定理的原始论证与进一步应用；随机检验须注意采样域和次数条件 |

## 公开讲义、论文与计算文档

1. Noga Alon, *Combinatorial Nullstellensatz*, Combinatorics, Probability and Computing 8 (1999), 7–29。[作者论文](https://web.math.princeton.edu/~nalon/PDFS/null2.pdf)。可结合组合零点定理与加法组合章节，阅读有限网格消失理想和系数判别。
2. [SageMath 有限域构造器官方文档](https://doc.sagemath.org/html/en/reference/finite_rings/sage/rings/finite_rings/finite_field_constructor.html)。比较不同不可约模多项式和域元素表示。
3. [SageMath 有限域基类官方文档](https://doc.sagemath.org/html/en/reference/finite_rings/sage/rings/finite_rings/finite_field_base.html)。继续学习基、对偶基与有限域 API。

4. J. S. Milne, *Fields and Galois Theory*, v5.10 (2022)。[作者课程讲义](https://www.jmilne.org/math/CourseNotes/FT.pdf)。用于对照域扩张、有限域、正规基、迹和范数的条件与证明。

## SageMath 扩展实验

以下示例**需要 SageMath 内核**，不由附带的标准 Python Notebook 执行：

```python
F = GF(9, name='a', modulus=PolynomialRing(GF(3), 'x').gen()**2 + 1)
a = F.gen()
zeta = 1 + a
print(a**2, a.multiplicative_order())
print(zeta.multiplicative_order())
print([zeta**i for i in range(1, 9)])
```

在此模型中，$a$ 的阶为 4，$\zeta$ 的阶为 8，二者都生成 $\mathbb F_9/\mathbb F_3$，但只有后者是本原元。变量名 `a` 本身不保证本原性。
