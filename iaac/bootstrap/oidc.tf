data "aws_iam_openid_connect_provider" "github" {
  url = "https://token.actions.githubusercontent.com"
}

data "aws_iam_policy_document" "github_assume_role" {
  statement {
    actions = ["sts:AssumeRoleWithWebIdentity"]
    principals {
      type        = "Federated"
      identifiers = [data.aws_iam_openid_connect_provider.github.arn]
    }
    condition {
      test     = "StringEquals"
      variable = "token.actions.githubusercontent.com:aud"
      values   = ["sts.amazonaws.com"]
    }
    condition {
      test     = "StringLike"
      variable = "token.actions.githubusercontent.com:sub"
      # Replace with the user's actual repo org/repo name, for example: repo:argly-com/one_page_argly:*
      # Assuming repo is argly-com/one_page_argly
      values   = ["repo:argly-com/one_page_argly:*"]
    }
  }
}

resource "aws_iam_role" "github_actions" {
  name               = "github-actions-argly-web-deploy"
  assume_role_policy = data.aws_iam_policy_document.github_assume_role.json
}

data "aws_iam_policy_document" "s3_deploy" {
  statement {
    actions = [
      "s3:PutObject",
      "s3:GetObject",
      "s3:ListBucket",
      "s3:DeleteObject"
    ]
    resources = [
      "arn:aws:s3:::argly-web-static",
      "arn:aws:s3:::argly-web-static/*"
    ]
  }
  
  statement {
    actions = [
      "cloudfront:CreateInvalidation"
    ]
    resources = ["*"]
  }
}

resource "aws_iam_role_policy" "github_actions_s3" {
  name   = "github-actions-deploy-policy"
  role   = aws_iam_role.github_actions.id
  policy = data.aws_iam_policy_document.s3_deploy.json
}
