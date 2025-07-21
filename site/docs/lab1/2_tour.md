---
---

# 1.2. Tour of Grafana Cloud

During the course of this workshop, you'll be observing applications in an AWS environment, which uses various AWS services, like:

- Lambda
- EC2
- Elastic Container Service (ECS)
- SQS
- RDS

In this first lab, we'll explore the Grafana Cloud UI, and get familiar with its key features.

## Step 1: Observe application performance

Grafana Cloud builds easy-to-use solutions on top of your telemetry signals, for easy correlation and faster root cause analysis.

When you want to get a single picture of the health of your applications on AWS, you can use **Grafana Cloud Application Observability**.

:::opentelemetry-tip

*Application Observability* is designed from the ground up to fully support OpenTelemetry. It allows you to monitor application health, group by specific attributes, and slice and dice your data in many ways.

:::

Let's take a look at our applications in this environment:

1.  Navigate to **Observability -> Application** in the left-hand menu.

1.  This will take you to the **Service Inventory** page, where you can see all your OpenTelemetry-instrumented services.

    Notice how the Service Inventory automatically detects your runtime languages and detects your AWS resources (denoted by the AWS icon).

1.  Click on the **tickets-server** service to view detailed metrics, logs, and traces for that service.

1.  In the main view, we see Request Rate, Error Rate, and Latency for the service.

    The **P95** latency is shown in the top right corner, which means that 95% of requests are served within this time. This is a key metric for understanding the performance of your service. 

1.  By **Group by**, click on **cloud.availability_zone**. Now we can see the distribution of our requests across each AWS availability zone.

    This could help us to troubleshoot problems in a particular AWS availability zone, for example.

1.  Click on the **Traces** tab.

1.  Click on a trace to see detected process, ECS task name, cloud region, and other attributes.

    These are attributes that are detected by our OpenTelemetry instrumentation and can give us rich context to help us correlate or filter signals.


## Step 2: Observe AWS infrastructure

The Grafana Cloud **AWS Observability app** provides a comprehensive view of your AWS infrastructure, including resources like EC2 and RDS instances.

1.  Click on **Observability -> Cloud provider**.

1.  Click on **Configuration -> Scrape jobs**.

    - We've already created a scrape job for you

    - The scrape job fetches CloudWatch metrics from AWS and brings them into your Grafana instance.

1.  Since we are bringing CloudWatch metrics into Grafana, click on the Alerts tab to see some prepopulated alerts, which will help you understand when things are going wrong in your infrastructure. Grafana automatically creates these for you when you set up the AWS integration.

1.  Click on the **Dashboards** tab to see out-of-the-box dashboards with metrics and information from your AWS services.

You can use this app to monitor many different core AWS services, like EC2, Lambda and RDS.

:::tip

For any services which you're unable to instrument directly with OpenTelemetry, you can use the CloudWatch data source to bring in metrics and logs. This means you can correlate across services and boundaries, across almost any AWS service.

Learn more about the CloudWatch data source.

:::

## Step 3: Explore the underlying telemetry

Underneath Grafana Cloud, all of your telemetry data is stored in our open source telemetry backends. Whenever you want to explore signals directly, you can use the Drilldown apps.

1.  **Let's explore some telemetry signals!** We've already configured some of our applications to send traces to Grafana Cloud.

    Navigate to **Drilldown** from the side menu, then click on **Traces**.

1.  Drilldown Traces provides a powerful way to view and analyze traces collected, allowing you to see the flow of requests through your application, and how they are affected by different services along the way.

1.  The default view shows the rate of all traces, labelled as the **span rate**. Click on the **Errors rate** panel at the top to switch the view to show spans with errors.

    Now the view shows spans that have errors, which can help you identify issues in your application.

1.  Click on the **duration** panel to switch the view to showing a histogram of span durations.

    This view allows you to see typical durations of all of the requests flowing through your system. You can use this to:
    
    - find slow interactions
    - quickly find outliers.

1.  This view is showing all of our instrumented services. Let's zoom in a little and just find all **ECS** services.

    Using the filter panel at the top of the page, add a filter:

    **resource.cloud.platform** = **aws_ecs**

    Now we can see only traces from our AWS ECS tasks.



## Step 4: Connect your data, wherever it lives

Grafana Cloud allows you to bring your data, wherever it lives, even if it's in a private environment, using **Private Data Source Connect**.

Let's test this out by connecting to our application's RDS database.

1.  From the side menu, navigate to **Connections > Data sources**

1.  Open the **tickets-db** data source.

1.  Scroll to the bottom of the page and note that we're using Private Datasource Connect, which allows us to connect to data sources anywhere, even if they are in private networks.

    :::info

    We have already configured Private Data Source Connect for you here, but if you want t configure it in your own environment, you can read more about it here:
    
    https://grafana.com/docs/grafana-cloud/connect-externally-hosted/private-data-source-connect/ 

    :::

1.  Now let's run a database query. From the top of the data source edit page, click on the **Explore data** button. 

    OR, from the side menu navigate to **Explore** and then select the **tickets-db** data source.

1.  Switch to **Code** view, then type the following SQL statement:

    ```
    SELECT COUNT(*) FROM booking;
    ```

1.  We have a successful connection to our database! We can now use this to correlate real data in Grafana.


## Wrapping Up

In this lab, you learned how to:

- Navigate the Grafana Cloud UI

- Understand Application Observability 

- Understand how to connect your data, wherever it lives

Click **Next** to continue to the next module.
